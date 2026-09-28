import React, { useState, useMemo } from 'react';
import { StandingTeam, TournamentHonor } from '../types';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Star, 
  Sliders, 
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

interface StandingsSectionProps {
  standings: StandingTeam[];
  tournaments: TournamentHonor[];
  onOpenEditor?: () => void;
}

type StandingsSortField = 
  | 'rank' 
  | 'teamName' 
  | 'played' 
  | 'won' 
  | 'lost' 
  | 'drawn' 
  | 'goalsFor' 
  | 'goalsAgainst' 
  | 'goalDifference' 
  | 'pointsPerGame' 
  | 'points';

export const StandingsSection: React.FC<StandingsSectionProps> = ({
  standings,
  tournaments,
  onOpenEditor,
}) => {
  // Default sort: Points Per Game (PPG) descending
  const [sortField, setSortField] = useState<StandingsSortField>('pointsPerGame');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const getEffectivePPG = (t: StandingTeam): number => {
    if (typeof t.pointsPerGame === 'number' && !isNaN(t.pointsPerGame) && t.pointsPerGame > 0) {
      return t.pointsPerGame;
    }
    const gp = t.played ?? ((t.won || 0) + (t.drawn || 0) + (t.lost || 0));
    return gp > 0 ? Number(((t.points || 0) / gp).toFixed(2)) : 0;
  };

  const handleHeaderClick = (field: StandingsSortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // For text (teamName) default to asc, for numerical stats default to desc
      setSortDir(field === 'teamName' ? 'asc' : 'desc');
    }
  };

  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'pointsPerGame': {
          const ppgA = getEffectivePPG(a);
          const ppgB = getEffectivePPG(b);
          if (ppgA !== ppgB) comp = ppgA - ppgB;
          else if ((a.points || 0) !== (b.points || 0)) comp = (a.points || 0) - (b.points || 0);
          else comp = (a.goalDifference || 0) - (b.goalDifference || 0);
          break;
        }
        case 'points':
          if ((a.points || 0) !== (b.points || 0)) comp = (a.points || 0) - (b.points || 0);
          else comp = getEffectivePPG(a) - getEffectivePPG(b);
          break;
        case 'teamName':
          comp = (a.teamName || '').localeCompare(b.teamName || '');
          break;
        case 'rank':
          comp = (a.rank || 0) - (b.rank || 0);
          break;
        case 'played':
          comp = (a.played || 0) - (b.played || 0);
          break;
        case 'won':
          comp = (a.won || 0) - (b.won || 0);
          break;
        case 'lost':
          comp = (a.lost || 0) - (b.lost || 0);
          break;
        case 'drawn':
          comp = (a.drawn || 0) - (b.drawn || 0);
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
          comp = getEffectivePPG(a) - getEffectivePPG(b);
      }
      return sortDir === 'asc' ? comp : -comp;
    });
  }, [standings, sortField, sortDir]);

  const renderSortHeader = (field: StandingsSortField, label: string, className = '') => {
    const isActive = sortField === field;
    return (
      <th 
        onClick={() => handleHeaderClick(field)}
        className={`py-3.5 px-2.5 transition-colors cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 ${className} ${
          isActive ? 'text-[#00ADEF] dark:text-[#00ADEF]' : ''
        }`}
        title={`Click to sort by ${label} (${isActive && sortDir === 'desc' ? 'ascending' : 'descending'})`}
      >
        <div className="inline-flex items-center gap-1">
          <span>{label}</span>
          <span className="shrink-0">
            {isActive ? (
              sortDir === 'desc' ? (
                <ArrowDown className="w-3 h-3 text-[#00ADEF]" />
              ) : (
                <ArrowUp className="w-3 h-3 text-[#00ADEF]" />
              )
            ) : (
              <ArrowUpDown className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <section id="standings" className="py-8 sm:py-12 bg-slate-50 dark:bg-[#060911] border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              LEAGUE <span className="text-[#00ADEF]">STANDINGS</span> & TROPHIES
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Official 2026-2027 Northern California ECNL table standings and national championship tournament pathways. 
              Sorted by Points Per Game (PPG) descending.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 text-xs font-bold border border-yellow-500/30 transition-colors"
              title="Open ECNL Official NorCal Standings"
            >
              <span>ECNL Source (NorCal U16)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
                title="Edit Standings in Team Editor"
              >
                <Sliders className="w-3.5 h-3.5 text-[#00ADEF]" />
                <span>Edit Standings Table</span>
              </button>
            )}
          </div>
        </div>

        {/* Standings Table */}
        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#0b1326] font-sans font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {renderSortHeader('rank', 'POS', 'w-16 text-center')}
                {renderSortHeader('teamName', 'TEAMS', 'min-w-[200px]')}
                {renderSortHeader('played', 'GP', 'text-center')}
                {renderSortHeader('won', 'WINS', 'text-center')}
                {renderSortHeader('lost', 'LOSSES', 'text-center')}
                {renderSortHeader('drawn', 'DRAWS', 'text-center')}
                {renderSortHeader('goalsFor', 'GF', 'text-center hidden md:table-cell')}
                {renderSortHeader('goalsAgainst', 'GA', 'text-center hidden md:table-cell')}
                {renderSortHeader('goalDifference', 'GD', 'text-center')}
                {renderSortHeader('pointsPerGame', 'PPG', 'text-center font-black')}
                {renderSortHeader('points', 'PTS', 'text-center font-black')}
                <th className="py-3.5 px-3 text-center hidden lg:table-cell">FORM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {sortedStandings.map((team, idx) => {
                const isDeAnza = team.isCurrentTeam || team.teamName.includes('De Anza');
                const hasPlayed = team.played > 0;
                const ppg = getEffectivePPG(team);
                const displayRank = sortField === 'pointsPerGame' && sortDir === 'desc' ? idx + 1 : (team.rank || idx + 1);

                return (
                  <tr
                    key={team.teamName}
                    className={`transition-colors ${
                      isDeAnza
                        ? 'bg-gradient-to-r from-blue-950/80 via-blue-900/40 to-blue-950/80 font-semibold border-l-4 border-l-blue-500 shadow-inner'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Rank / POS */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-sans font-bold text-xs ${
                          displayRank === 1
                            ? 'bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 border border-yellow-500/40'
                            : displayRank <= 3
                            ? 'bg-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {displayRank}
                      </span>
                    </td>

                    {/* Team Name */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">
                            {team.teamName}
                          </span>
                          {isDeAnza && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white shadow whitespace-nowrap">
                              OUR SQUAD
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          Qualification: {team.qualification || (displayRank <= 4 ? 'ECNL National Playoffs Zone' : 'NorCal Conference')}
                        </span>
                      </div>
                    </td>

                    {/* GP */}
                    <td className="py-3.5 px-2.5 text-center font-semibold text-slate-700 dark:text-slate-200">
                      {hasPlayed ? team.played : ''}
                    </td>

                    {/* WINS */}
                    <td className="py-3.5 px-2.5 text-center font-semibold text-slate-900 dark:text-white">
                      {hasPlayed ? team.won : ''}
                    </td>

                    {/* LOSSES */}
                    <td className="py-3.5 px-2.5 text-center text-slate-600 dark:text-slate-400">
                      {hasPlayed ? team.lost : ''}
                    </td>

                    {/* DRAWS */}
                    <td className="py-3.5 px-2.5 text-center text-slate-600 dark:text-slate-400">
                      {hasPlayed ? team.drawn : ''}
                    </td>

                    {/* GF */}
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell text-slate-600 dark:text-slate-300">
                      {hasPlayed ? team.goalsFor : ''}
                    </td>

                    {/* GA */}
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell text-slate-500 dark:text-slate-400">
                      {hasPlayed ? team.goalsAgainst : ''}
                    </td>

                    {/* GD */}
                    <td className="py-3.5 px-2.5 text-center font-bold">
                      {hasPlayed ? (
                        team.goalDifference < 0 ? (
                          <span className="text-red-500 dark:text-red-400">{team.goalDifference}</span>
                        ) : (
                          <span className="text-slate-900 dark:text-white">+{team.goalDifference}</span>
                        )
                      ) : ''}
                    </td>

                    {/* PPG */}
                    <td className="py-3.5 px-2.5 text-center font-mono text-xs sm:text-sm font-black text-[#00ADEF]">
                      {hasPlayed ? ppg.toFixed(2) : '0.00'}
                    </td>

                    {/* PTS */}
                    <td className="py-3.5 px-4 text-center font-sans font-black text-base sm:text-lg text-slate-900 dark:text-white">
                      {team.points}
                    </td>

                    {/* FORM */}
                    <td className="py-3.5 px-3 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {team.form && team.form.length > 0 ? (
                          team.form.map((result, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded-md text-[10px] font-sans font-bold flex items-center justify-center ${
                                result === 'W'
                                  ? 'bg-emerald-600 text-white'
                                  : result === 'D'
                                  ? 'bg-amber-600 text-white'
                                  : result === 'L'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {result}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
