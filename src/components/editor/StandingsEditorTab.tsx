import React, { useState, useEffect } from 'react';
import type { StandingTeam, TeamInfo } from '../../types';
import { INITIAL_STANDINGS } from '../../data/defaultData';
import {
  fetchStandingsFromGoogleSheet,
  getSunday9pmPacificWindow,
  buildUpdatedTeamInfoFromStandings,
} from '../../utils/standingsCron';
import { 
  Trophy, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Link2, 
  Calculator, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock
} from 'lucide-react';

interface StandingsEditorTabProps {
  standings: StandingTeam[];
  teamInfo: TeamInfo;
  onSaveStandings: (standings: StandingTeam[]) => void;
  onSaveTeamInfo: (info: TeamInfo) => void;
  showNotification: (msg: string) => void;
  onOpenEcnlSyncModal?: () => void;
}

type StandingsSortField = 
  | 'rank' 
  | 'teamName' 
  | 'played' 
  | 'won' 
  | 'drawn' 
  | 'lost' 
  | 'goalsFor' 
  | 'goalsAgainst' 
  | 'goalDifference' 
  | 'points' 
  | 'pointsPerGame';

export const StandingsEditorTab: React.FC<StandingsEditorTabProps> = ({
  standings,
  teamInfo,
  onSaveStandings,
  onSaveTeamInfo,
  showNotification,
  onOpenEcnlSyncModal,
}) => {
  // Sort by Points Per Game (PPG) descending by default
  const sortStandingsByPPG = (list: StandingTeam[]) => {
    return [...list].sort((a, b) => {
      const ppgA = a.pointsPerGame ?? (a.played > 0 ? a.points / a.played : 0);
      const ppgB = b.pointsPerGame ?? (b.played > 0 ? b.points / b.played : 0);
      if (ppgA !== ppgB) return ppgB - ppgA;
      if (a.points !== b.points) return (b.points || 0) - (a.points || 0);
      return (b.goalDifference || 0) - (a.goalDifference || 0);
    }).map((team, idx) => ({ ...team, rank: idx + 1 }));
  };

  const [localStandings, setLocalStandings] = useState<StandingTeam[]>(() => sortStandingsByPPG(standings));
  const [sortField, setSortField] = useState<StandingsSortField>('pointsPerGame');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [standingsSheetUrl, setStandingsSheetUrl] = useState<string>(teamInfo.standingsGoogleSheetUrl || '');
  const [standingsCronEnabled, setStandingsCronEnabled] = useState<boolean>(teamInfo.standingsCronEnabled ?? true);
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);

  const { nextSundayFormatted } = getSunday9pmPacificWindow();

  useEffect(() => {
    if (teamInfo.standingsGoogleSheetUrl && !standingsSheetUrl) {
      setStandingsSheetUrl(teamInfo.standingsGoogleSheetUrl);
    }
    if (teamInfo.standingsCronEnabled !== undefined) {
      setStandingsCronEnabled(teamInfo.standingsCronEnabled);
    }
  }, [teamInfo.standingsGoogleSheetUrl, teamInfo.standingsCronEnabled]);

  const handleSyncSheetNow = async () => {
    if (!standingsSheetUrl.trim()) return;
    setIsSyncingSheet(true);
    try {
      const parsed = await fetchStandingsFromGoogleSheet(standingsSheetUrl.trim());
      if (parsed.standings.length === 0) {
        showNotification(parsed.errors.join(' | ') || 'Could not parse League Table rows from Google Sheet.');
        return;
      }
      setLocalStandings(parsed.standings);
      onSaveStandings(parsed.standings);

      const updatedInfo = buildUpdatedTeamInfoFromStandings(
        parsed.standings,
        {
          ...teamInfo,
          standingsCronEnabled,
        },
        standingsSheetUrl.trim()
      );
      setLocalRecord(updatedInfo.seasonRecord);
      onSaveTeamInfo(updatedInfo);
      setHasChanges(false);

      fetch('/api/ecnl/configure-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standingsGoogleSheetUrl: standingsSheetUrl.trim(),
          standingsCronEnabled,
        }),
      }).catch(() => {});

      showNotification(
        `Synced ${parsed.standings.length} teams from Google Sheet${
          parsed.forceTeam
            ? ` — Force #${parsed.forceTeam.rank} (${parsed.forceTeam.won}-${parsed.forceTeam.lost}-${parsed.forceTeam.drawn})`
            : ''
        }!`
      );
    } catch (err: any) {
      showNotification(`Sheet sync error: ${err?.message || 'Failed to load Google Sheet'}`);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const handleSaveSheetCronSettings = (nextCron?: boolean) => {
    const cronVal = nextCron !== undefined ? nextCron : standingsCronEnabled;
    if (nextCron !== undefined) setStandingsCronEnabled(nextCron);
    onSaveTeamInfo({
      ...teamInfo,
      seasonRecord: localRecord,
      standingsGoogleSheetUrl: standingsSheetUrl.trim(),
      standingsCronEnabled: cronVal,
    });
    fetch('/api/ecnl/configure-cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        standingsGoogleSheetUrl: standingsSheetUrl.trim(),
        standingsCronEnabled: cronVal,
      }),
    }).catch(() => {});
    showNotification('Saved AppScript Google Sheet URL & Sunday 9:00 PM PT cron schedule.');
  };
  const [localRecord, setLocalRecord] = useState(teamInfo.seasonRecord || {
    wins: 0,
    losses: 0,
    draws: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    cleanSheets: 0,
    norcalRank: 4,
    nationalRank: 65,
  });
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setLocalStandings(standings);
  }, [standings]);

  React.useEffect(() => {
    if (teamInfo.seasonRecord) {
      setLocalRecord(teamInfo.seasonRecord);
    }
  }, [teamInfo]);

  const handleUpdateRecord = (field: keyof typeof localRecord, val: number) => {
    setLocalRecord(prev => ({ ...prev, [field]: val }));
    setHasChanges(true);
  };

  const handleUpdateTeamRow = (index: number, field: keyof StandingTeam, val: any) => {
    setLocalStandings(prev => {
      const copy = [...prev];
      const updatedRow = { ...copy[index], [field]: val };

      // Auto-calculate Points, Goal Diff, and PPG if match records change
      if (['won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst'].includes(field as string)) {
        const w = field === 'won' ? Number(val) : (updatedRow.won || 0);
        const d = field === 'drawn' ? Number(val) : (updatedRow.drawn || 0);
        const l = field === 'lost' ? Number(val) : (updatedRow.lost || 0);
        const gf = field === 'goalsFor' ? Number(val) : (updatedRow.goalsFor || 0);
        const ga = field === 'goalsAgainst' ? Number(val) : (updatedRow.goalsAgainst || 0);

        updatedRow.played = w + d + l;
        updatedRow.points = w * 3 + d;
        updatedRow.goalDifference = gf - ga;
        updatedRow.pointsPerGame = updatedRow.played > 0 ? Number((updatedRow.points / updatedRow.played).toFixed(2)) : 0;
      }

      copy[index] = updatedRow;
      return copy;
    });
    setHasChanges(true);
  };

  const handleSortByPoints = () => {
    handleHeaderSort('pointsPerGame');
    showNotification('Sorted standings table by points per game (PPG).');
  };

  const handleHeaderSort = (field: StandingsSortField) => {
    const nextDir = sortField === field && sortDir === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDir(nextDir);

    const sorted = [...localStandings].sort((a, b) => {
      let comp = 0;
      switch (field) {
        case 'pointsPerGame': {
          const ppgA = a.pointsPerGame ?? (a.played > 0 ? a.points / a.played : 0);
          const ppgB = b.pointsPerGame ?? (b.played > 0 ? b.points / b.played : 0);
          if (ppgA !== ppgB) comp = ppgA - ppgB;
          else if ((a.points || 0) !== (b.points || 0)) comp = (a.points || 0) - (b.points || 0);
          else comp = (a.goalDifference || 0) - (b.goalDifference || 0);
          break;
        }
        case 'points':
          if ((a.points || 0) !== (b.points || 0)) comp = (a.points || 0) - (b.points || 0);
          else comp = (a.goalDifference || 0) - (b.goalDifference || 0);
          break;
        case 'teamName':
          comp = (a.teamName || '').localeCompare(b.teamName || '');
          break;
        case 'played':
          comp = (a.played || 0) - (b.played || 0);
          break;
        case 'won':
          comp = (a.won || 0) - (b.won || 0);
          break;
        case 'drawn':
          comp = (a.drawn || 0) - (b.drawn || 0);
          break;
        case 'lost':
          comp = (a.lost || 0) - (b.lost || 0);
          break;
        case 'goalsFor':
          comp = (a.goalsFor || 0) - (b.goalsFor || 0);
          break;
        case 'goalsAgainst':
          comp = (a.goalsAgainst || 0) - (b.goalsAgainst || 0);
          break;
        case 'goalDifference':
          comp = (a.goalDifference || 0) - (b.goalDifference || 0);
          break;
        default:
          comp = (a.rank || 0) - (b.rank || 0);
      }
      return nextDir === 'asc' ? comp : -comp;
    }).map((team, idx) => ({ ...team, rank: idx + 1 }));

    setLocalStandings(sorted);
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    onSaveStandings(localStandings);
    onSaveTeamInfo({
      ...teamInfo,
      seasonRecord: localRecord,
    });
    setHasChanges(false);
    showNotification('✓ Saved standings table and season record to database!');
  };

  const handleResetToDefaultTable = () => {
    setLocalStandings(INITIAL_STANDINGS);
    setHasChanges(true);
    showNotification('Reset to official NorCal conference baseline table. Remember to click "Save Standings".');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white mb-1">
            Team Season Record & ECNL Standings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update overall record stats shown in the Hero banner and full NorCal Conference table.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenEcnlSyncModal && (
            <button
              type="button"
              onClick={onOpenEcnlSyncModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00ADEF] hover:bg-[#00ADEF]/90 text-slate-950 font-condensed font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync ECNL Scores &amp; Table</span>
            </button>
          )}

          <a
            href="https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 text-xs font-bold border border-yellow-500/30 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Official ECNL NorCal Table</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all ${
              hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasChanges ? 'Save Changes *' : 'Save Standings & Record'}</span>
          </button>
        </div>
      </div>

      {/* AppScript Google Sheet Sync & Weekly Sunday 9pm PT Cron Card */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white">
              AppScript Google Sheet League Table Sync
            </h4>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
              Cron: Sundays @ 9:00 PM PT
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Next run: <strong className="text-slate-800 dark:text-slate-200">{nextSundayFormatted}</strong>
            </span>
            <label className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={standingsCronEnabled}
                onChange={e => handleSaveSheetCronSettings(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Auto-Sync Weekly</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={standingsSheetUrl}
            onChange={e => setStandingsSheetUrl(e.target.value)}
            placeholder="Paste your AppScript League Table Google Sheet URL (https://docs.google.com/spreadsheets/d/...)"
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSaveSheetCronSettings()}
              disabled={!standingsSheetUrl.trim()}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save URL</span>
            </button>
            <button
              type="button"
              onClick={handleSyncSheetNow}
              disabled={!standingsSheetUrl.trim() || isSyncingSheet}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
              <span>{isSyncingSheet ? 'Syncing Sheet...' : 'Sync from Google Sheet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Season Record Hero Stats */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
        <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Hero Banner Season Record & Rankings</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          <div>
            <label className="block text-slate-500 font-bold mb-1">Wins (W)</label>
            <input
              type="text"
              value={localRecord.wins}
              onChange={e => handleUpdateRecord('wins', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Losses (L)</label>
            <input
              type="text"
              value={localRecord.losses}
              onChange={e => handleUpdateRecord('losses', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Draws (D)</label>
            <input
              type="text"
              value={localRecord.draws}
              onChange={e => handleUpdateRecord('draws', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Clean Sheets</label>
            <input
              type="text"
              value={localRecord.cleanSheets}
              onChange={e => handleUpdateRecord('cleanSheets', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Goals For (GF)</label>
            <input
              type="text"
              value={localRecord.goalsFor}
              onChange={e => handleUpdateRecord('goalsFor', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">Goals Against (GA)</label>
            <input
              type="text"
              value={localRecord.goalsAgainst}
              onChange={e => handleUpdateRecord('goalsAgainst', parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">NorCal Rank</label>
            <input
              type="text"
              value={localRecord.norcalRank || 4}
              onChange={e => handleUpdateRecord('norcalRank', parseInt(e.target.value, 10) || 1)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-1">National Rank</label>
            <input
              type="text"
              value={localRecord.nationalRank || 65}
              onChange={e => handleUpdateRecord('nationalRank', parseInt(e.target.value, 10) || 1)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-center"
            />
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h4 className="font-condensed font-black text-base uppercase text-slate-900 dark:text-white">
            NorCal Conference League Table ({localStandings.length} Teams)
          </h4>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSortByPoints}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" />
              <span>Sort by Points / PPG</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefaultTable}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/40 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Table</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase font-condensed font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                {[
                  { field: 'rank' as StandingsSortField, label: 'Rank', cls: 'text-center w-14' },
                  { field: 'teamName' as StandingsSortField, label: 'Team Name', cls: 'min-w-[180px]' },
                  { field: 'played' as StandingsSortField, label: 'GP', cls: 'text-center w-14' },
                  { field: 'won' as StandingsSortField, label: 'W', cls: 'text-center w-14' },
                  { field: 'drawn' as StandingsSortField, label: 'D', cls: 'text-center w-14' },
                  { field: 'lost' as StandingsSortField, label: 'L', cls: 'text-center w-14' },
                  { field: 'goalsFor' as StandingsSortField, label: 'GF', cls: 'text-center w-14' },
                  { field: 'goalsAgainst' as StandingsSortField, label: 'GA', cls: 'text-center w-14' },
                  { field: 'goalDifference' as StandingsSortField, label: 'GD', cls: 'text-center w-14' },
                  { field: 'points' as StandingsSortField, label: 'PTS', cls: 'text-center w-16' },
                  { field: 'pointsPerGame' as StandingsSortField, label: 'PPG', cls: 'text-center w-16' },
                ].map(({ field, label, cls }) => {
                  const isActive = sortField === field;
                  return (
                    <th
                      key={field}
                      onClick={() => handleHeaderSort(field)}
                      className={`p-2.5 ${cls} cursor-pointer select-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 ${
                        isActive ? 'text-[#00ADEF]' : ''
                      }`}
                      title={`Click to sort by ${label}`}
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>{label}</span>
                        {isActive ? (
                          sortDir === 'desc' ? (
                            <ArrowDown className="w-3 h-3 text-[#00ADEF]" />
                          ) : (
                            <ArrowUp className="w-3 h-3 text-[#00ADEF]" />
                          )
                        ) : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {localStandings.map((team, idx) => {
                const isForce = team.isForce || team.teamName.includes('De Anza');
                return (
                  <tr 
                    key={team.teamName || idx}
                    className={`transition-colors ${isForce ? 'bg-blue-50/70 dark:bg-blue-950/30 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                  >
                    <td className="p-2 text-center font-black text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={team.teamName}
                        onChange={e => handleUpdateTeamRow(idx, 'teamName', e.target.value)}
                        className={`w-full p-1.5 rounded-lg bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white ${isForce ? 'text-blue-600 dark:text-[#00ADEF] font-black' : ''}`}
                      />
                    </td>
                    <td className="p-2 text-center text-slate-500 font-bold">
                      {team.played ?? ((team.won || 0) + (team.drawn || 0) + (team.lost || 0))}
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={team.won || 0}
                        onChange={e => handleUpdateTeamRow(idx, 'won', parseInt(e.target.value, 10) || 0)}
                        className="w-12 p-1 text-center rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={team.drawn || 0}
                        onChange={e => handleUpdateTeamRow(idx, 'drawn', parseInt(e.target.value, 10) || 0)}
                        className="w-12 p-1 text-center rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-bold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={team.lost || 0}
                        onChange={e => handleUpdateTeamRow(idx, 'lost', parseInt(e.target.value, 10) || 0)}
                        className="w-12 p-1 text-center rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-red-600 dark:text-red-400 font-bold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={team.goalsFor || 0}
                        onChange={e => handleUpdateTeamRow(idx, 'goalsFor', parseInt(e.target.value, 10) || 0)}
                        className="w-12 p-1 text-center rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="text"
                        value={team.goalsAgainst || 0}
                        onChange={e => handleUpdateTeamRow(idx, 'goalsAgainst', parseInt(e.target.value, 10) || 0)}
                        className="w-12 p-1 text-center rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      />
                    </td>
                    <td className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td className="p-2 text-center font-black text-blue-600 dark:text-[#00ADEF]">
                      {team.points}
                    </td>
                    <td className="p-2 text-center text-slate-500 font-bold">
                      {team.pointsPerGame ? team.pointsPerGame.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
