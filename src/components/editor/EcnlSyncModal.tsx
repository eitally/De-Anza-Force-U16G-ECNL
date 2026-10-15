import React, { useState, useEffect, useMemo } from 'react';
import type { Match, StandingTeam, TeamInfo } from '../../types';
import { syncStandingsAndTeamInfoWithMatches } from '../../utils/recordUtils';
import {
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  X,
  Trophy,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  ClipboardPaste,
} from 'lucide-react';

const ECNL_STANDINGS_URL = 'https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx';
const ECNL_SCHEDULE_URL = 'https://theecnl.com/sports/2023/8/8/ECNLG_0808235238.aspx';

interface EcnlSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  standings: StandingTeam[];
  teamInfo: TeamInfo;
  onSaveMatches: (matches: Match[]) => void;
  onSaveStandings: (standings: StandingTeam[]) => void;
  onSaveTeamInfo: (info: TeamInfo) => void;
  showNotification: (msg: string) => void;
}

export const EcnlSyncModal: React.FC<EcnlSyncModalProps> = ({
  isOpen,
  onClose,
  matches,
  standings,
  teamInfo,
  onSaveMatches,
  onSaveStandings,
  onSaveTeamInfo,
  showNotification,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');
  const [showSmartPaste, setShowSmartPaste] = useState(false);
  const [previewMatches, setPreviewMatches] = useState<Match[]>(matches);
  const [previewStandings, setPreviewStandings] = useState<StandingTeam[]>(standings);
  const [syncNotes, setSyncNotes] = useState<string | null>(null);
  const [lastSyncedSource, setLastSyncedSource] = useState<string | null>(null);
  const [autoCheckWeekly, setAutoCheckWeekly] = useState<boolean>(teamInfo.ecnlAutoCheckEnabled !== false);

  useEffect(() => {
    if (isOpen) {
      setPreviewMatches(matches.map(m => ({ ...m })));
      setPreviewStandings(standings.map(s => ({ ...s })));
      setAutoCheckWeekly(teamInfo.ecnlAutoCheckEnabled !== false);
      handleRunSync('');
    }
  }, [isOpen]);

  const handleRunSync = async (textToParse: string = rawPasteText) => {
    setIsSyncing(true);
    setSyncNotes(null);
    try {
      const response = await fetch('/api/ecnl/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: textToParse,
          currentMatches: previewMatches.length > 0 ? previewMatches : matches,
          currentStandings: previewStandings.length > 0 ? previewStandings : standings,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Could not complete ECNL sync check.');
      }

      setPreviewMatches(data.matches || matches);
      setPreviewStandings(data.standings || standings);
      setLastSyncedSource(data.sourceMethod || 'reconciled');
      if (textToParse.trim()) {
        setRawPasteText('');
        setShowSmartPaste(false);
      }
      if (data.matchesUpdatedCount > 0 || data.standingsUpdatedCount > 0) {
        setSyncNotes(
          `Detected ${data.matchesUpdatedCount} match score update(s) and ${data.standingsUpdatedCount} club standings adjustment(s). Review below before publishing.`
        );
      } else {
        setSyncNotes('Standings and match scores are reconciled with all completed ECNL Northern California GU16 fixtures.');
      }
    } catch (err: any) {
      setSyncNotes(err?.message || 'Unable to reach ECNL sync endpoint; using local schedule reconciliation.');
      const fallback = syncStandingsAndTeamInfoWithMatches(previewMatches, previewStandings, teamInfo);
      setPreviewStandings(fallback.updatedStandings);
    } finally {
      setIsSyncing(false);
    }
  };

  // Allow quick score entry in the review preview for any ECNL match and auto-recompute standings
  const handleQuickScoreChange = (matchId: string, field: 'teamScore' | 'opponentScore', value: string) => {
    const numVal = value.trim() === '' ? undefined : parseInt(value, 10);
    const nextMatches = previewMatches.map(m => {
      if (m.id !== matchId) return m;
      const updated = {
        ...m,
        [field]: isNaN(numVal as number) ? undefined : numVal,
      };
      if (typeof updated.teamScore === 'number' && typeof updated.opponentScore === 'number') {
        updated.status = 'completed';
      } else {
        updated.status = 'upcoming';
      }
      return updated;
    });
    setPreviewMatches(nextMatches);
    const synced = syncStandingsAndTeamInfoWithMatches(nextMatches, previewStandings, teamInfo);
    setPreviewStandings(synced.updatedStandings);
  };

  // Compute diff summary between original props and preview state
  const matchDiffs = useMemo(() => {
    const origMap = new Map<string, Match>(matches.map(m => [m.id, m]));
    return previewMatches.filter(pm => {
      const orig = origMap.get(pm.id);
      if (!orig) return true;
      return orig.teamScore !== pm.teamScore || orig.opponentScore !== pm.opponentScore || orig.status !== pm.status;
    });
  }, [matches, previewMatches]);

  const standingDiffMap = useMemo(() => {
    const map = new Map<string, { oldRank: number; oldPoints: number; oldPlayed: number; changed: boolean }>();
    standings.forEach(s => {
      map.set(s.teamName.toLowerCase(), {
        oldRank: s.rank,
        oldPoints: s.points,
        oldPlayed: s.played,
        changed: false,
      });
    });
    previewStandings.forEach(ps => {
      const key = ps.teamName.toLowerCase();
      const prev = map.get(key);
      if (prev) {
        const changed = prev.oldRank !== ps.rank || prev.oldPoints !== ps.points || prev.oldPlayed !== ps.played;
        map.set(key, { ...prev, changed });
      }
    });
    return map;
  }, [standings, previewStandings]);

  const ecnlMatchesToReview = useMemo(() => {
    return [...previewMatches]
      .filter(m => m.competition === 'ECNL Northern California')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [previewMatches]);

  const handleApproveAndPublish = () => {
    const synced = syncStandingsAndTeamInfoWithMatches(previewMatches, previewStandings, {
      ...teamInfo,
      lastEcnlSyncAt: new Date().toISOString(),
      ecnlAutoCheckEnabled: autoCheckWeekly,
    });

    onSaveMatches(previewMatches);
    onSaveStandings(synced.updatedStandings);
    onSaveTeamInfo({
      ...synced.updatedTeamInfo,
      lastEcnlSyncAt: new Date().toISOString(),
      ecnlAutoCheckEnabled: autoCheckWeekly,
    });

    showNotification(
      `Published ECNL NorCal GU16 updates (${synced.computed.wins}W-${synced.computed.losses}L-${synced.computed.draws}D, Rank #${synced.updatedTeamInfo.seasonRecord.norcalRank})`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl rounded-2xl bg-[#090f1d] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#0d1629] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00ADEF]/15 border border-[#00ADEF]/40 flex items-center justify-center text-[#00ADEF] shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-condensed font-black text-xl sm:text-2xl uppercase tracking-wide text-white">
                ECNL Northern California GU16 — Weekly Score &amp; Table Sync
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span>Conference: Northern California (G2010 / GU16)</span>
                <span aria-hidden="true">·</span>
                <span>
                  Last Synced:{' '}
                  {teamInfo.lastEcnlSyncAt
                    ? new Date(teamInfo.lastEcnlSyncAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Not yet recorded'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCheckWeekly}
                onChange={e => setAutoCheckWeekly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#00ADEF] focus:ring-[#00ADEF] bg-slate-950 border-slate-700"
              />
              <span>Auto-Check Weekly</span>
            </label>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Sync Review"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Toolbar & Official ECNL Source Links */}
        <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={ECNL_STANDINGS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#00ADEF] hover:underline font-medium"
            >
              <span>Official ECNL GU16 Standings Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-slate-700">·</span>
            <a
              href={ECNL_SCHEDULE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#00ADEF] hover:underline font-medium"
            >
              <span>Official ECNL GU16 Schedule &amp; Scores</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowSmartPaste(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-[#00ADEF]" />
              <span>{showSmartPaste ? 'Hide Smart Paste' : 'Smart Paste ECNL Table / Scores'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunSync('')}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Checking ECNL...' : 'Re-Check & Reconcile Now'}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Status Banner */}
          {syncNotes && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncNotes}</span>
              </div>
              {lastSyncedSource && (
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  Mode: {lastSyncedSource}
                </span>
              )}
            </div>
          )}

          {/* Optional Smart Paste Drawer for instant ECNL copy-paste extraction */}
          {showSmartPaste && (
            <div className="p-4 rounded-xl bg-slate-900/95 border border-[#00ADEF]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00ADEF]" />
                  <h3 className="font-condensed font-bold text-sm uppercase tracking-wider text-white">
                    Smart Paste from ECNL Standings or Schedule Page
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Copy rows from theecnl.com and paste below for instant AI + table extraction
                </span>
              </div>
              <textarea
                rows={4}
                value={rawPasteText}
                onChange={e => setRawPasteText(e.target.value)}
                placeholder={
                  'Paste copied text from ECNL Northern California GU16 Standings or Schedule here...\nExample:\nMVLA 18 15 1 2 52 12 +40 47 2.61\nDe Anza Force 15 9 4 2 32 16 +16 29 1.93\n2026-02-28 De Anza Force 2 - 1 Marin FC'
                }
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:border-[#00ADEF] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleRunSync(rawPasteText)}
                  disabled={isSyncing || !rawPasteText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00ADEF] hover:bg-[#00ADEF]/90 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Scores &amp; Update Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* Split Grid: 12-Team Standings Preview + De Anza Force League Fixtures */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Cols: 12-Team ECNL Northern California GU16 Standings Table */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-condensed font-black text-base uppercase tracking-wider text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#00ADEF]" />
                  <span>12-Team NorCal GU16 Standings Preview</span>
                </h3>
                <span className="text-[11px] text-slate-400">Sorted by PPG / Points</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
                <table className="w-full text-left border-collapse text-xs tabular-nums">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-condensed tracking-wider">
                      <th className="py-2.5 px-2.5 text-center w-10"> Pos </th>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-2 text-center">GP</th>
                      <th className="py-2.5 px-2 text-center">W-L-D</th>
                      <th className="py-2.5 px-2 text-center">GF:GA</th>
                      <th className="py-2.5 px-2 text-center">GD</th>
                      <th className="py-2.5 px-2 text-center">PTS</th>
                      <th className="py-2.5 px-2.5 text-right">PPG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {previewStandings.map(team => {
                      const isForce = team.isCurrentTeam || team.isForce || team.teamName.toLowerCase().includes('de anza');
                      const diffInfo = standingDiffMap.get(team.teamName.toLowerCase());
                      const hasDiff = diffInfo?.changed;

                      return (
                        <tr
                          key={team.teamName}
                          className={
                            isForce
                              ? 'bg-blue-950/50 text-white font-semibold'
                              : hasDiff
                              ? 'bg-emerald-950/25 text-slate-100'
                              : 'text-slate-300 hover:bg-slate-900/40'
                          }
                        >
                          <td className="py-2 px-2.5 text-center font-mono font-bold">
                            <span className={isForce ? 'text-[#00ADEF]' : 'text-slate-400'}>#{team.rank}</span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{team.teamName}</span>
                              {isForce && (
                                <span className="text-[10px] font-mono text-[#00ADEF]">(Us)</span>
                              )}
                              {hasDiff && (
                                <span className="text-[10px] font-mono text-emerald-400">Updated</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center font-mono">{team.played}</td>
                          <td className="py-2 px-2 text-center font-mono">
                            {team.won}-{team.lost}-{team.drawn}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">
                            {team.goalsFor}:{team.goalsAgainst}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-white">
                            {team.points}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-[#00ADEF]">
                            {Number(team.pointsPerGame || 0).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 Cols: De Anza Force Match Scores & Quick Entry */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-condensed font-black text-base uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>De Anza Force ECNL Match Scores</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Edit any score to auto-update table
                </span>
              </div>

              <div className="overflow-y-auto max-h-[380px] rounded-xl border border-slate-800 bg-slate-950/80 divide-y divide-slate-800/70">
                {ecnlMatchesToReview.map(match => {
                  const isCompleted = match.status === 'completed';
                  const wasModified = matchDiffs.some(d => d.id === match.id);

                  return (
                    <div
                      key={match.id}
                      className={`p-3 flex items-center justify-between gap-3 text-xs ${
                        wasModified ? 'bg-emerald-950/30' : 'hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{match.date}</span>
                          <span>·</span>
                          <span>{match.isHome ? 'HOME' : 'AWAY'}</span>
                          {wasModified && (
                            <span className="text-emerald-400 font-semibold">· Modified</span>
                          )}
                        </div>
                        <div className="font-bold text-white truncate mt-0.5">
                          {match.isHome ? `vs ${match.opponent}` : `@ ${match.opponent}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 uppercase">Force</span>
                          <input
                            type="number"
                            min={0}
                            max={25}
                            value={match.teamScore ?? ''}
                            onChange={e => handleQuickScoreChange(match.id, 'teamScore', e.target.value)}
                            placeholder="-"
                            className="w-11 py-1 px-1.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white focus:border-[#00ADEF] focus:outline-none"
                          />
                        </div>
                        <span className="text-slate-500 font-bold mt-3">:</span>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-400 uppercase">Opp</span>
                          <input
                            type="number"
                            min={0}
                            max={25}
                            value={match.opponentScore ?? ''}
                            onChange={e => handleQuickScoreChange(match.id, 'opponentScore', e.target.value)}
                            placeholder="-"
                            className="w-11 py-1 px-1.5 rounded bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white focus:border-[#00ADEF] focus:outline-none"
                          />
                        </div>
                        <span
                          className={`ml-1.5 mt-3 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isCompleted
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : 'text-slate-400 bg-slate-900'
                          }`}
                        >
                          {isCompleted ? 'FT' : 'Sched'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#0d1629] border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-[#00ADEF] shrink-0" />
            <span>
              Approving updates will save all 12 NorCal GU16 club standings, De Anza Force match scores, and Hero season record to Firestore.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApproveAndPublish}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve &amp; Publish Updates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
