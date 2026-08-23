import React from 'react';
import { StandingTeam, TournamentHonor } from '../types';
import { Trophy, Award, TrendingUp, ShieldCheck, Star, Sliders, ExternalLink } from 'lucide-react';

interface StandingsSectionProps {
  standings: StandingTeam[];
  tournaments: TournamentHonor[];
  onOpenEditor?: () => void;
}

export const StandingsSection: React.FC<StandingsSectionProps> = ({
  standings,
  tournaments,
  onOpenEditor,
}) => {
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
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30 transition-colors"
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
                <th className="py-3.5 px-3 sm:px-4 w-12 text-center">POS</th>
                <th className="py-3.5 px-3 sm:px-4">CLUB / SQUAD</th>
                <th className="py-3.5 px-2.5 text-center">GP</th>
                <th className="py-3.5 px-2.5 text-center">W</th>
                <th className="py-3.5 px-2.5 text-center">L</th>
                <th className="py-3.5 px-2.5 text-center">D</th>
                <th className="py-3.5 px-2.5 text-center hidden md:table-cell">GF</th>
                <th className="py-3.5 px-2.5 text-center hidden md:table-cell">GA</th>
                <th className="py-3.5 px-2.5 text-center">GD</th>
                <th className="py-3.5 px-2.5 text-center hidden sm:table-cell font-bold text-slate-600 dark:text-slate-300">PPG</th>
                <th className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">PTS</th>
                <th className="py-3.5 px-3 text-center hidden lg:table-cell">FORM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {standings.map((team) => {
                const isDeAnza = team.isCurrentTeam;
                const ppg = typeof team.pointsPerGame === 'number'
                  ? team.pointsPerGame.toFixed(2)
                  : team.played > 0
                  ? (team.points / team.played).toFixed(2)
                  : '0.00';

                return (
                  <tr
                    key={team.teamName}
                    className={`transition-colors ${
                      isDeAnza
                        ? 'bg-gradient-to-r from-blue-950/80 via-blue-900/40 to-blue-950/80 font-semibold border-l-4 border-l-blue-500 shadow-inner'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-sans font-bold text-xs ${
                          team.rank === 1
                            ? 'bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 border border-yellow-500/40'
                            : team.rank <= 3
                            ? 'bg-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {team.rank}
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
                          Qualification: {team.qualification || 'n/a'}
                        </span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-2.5 text-center font-semibold text-slate-600 dark:text-slate-300">{team.played}</td>
                    <td className="py-3.5 px-2.5 text-center font-semibold text-slate-900 dark:text-white">{team.won}</td>
                    <td className="py-3.5 px-2.5 text-center text-slate-500 dark:text-slate-400">{team.lost}</td>
                    <td className="py-3.5 px-2.5 text-center text-slate-500 dark:text-slate-400">{team.drawn}</td>
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell text-slate-600 dark:text-slate-300">{team.goalsFor}</td>
                    <td className="py-3.5 px-2.5 text-center hidden md:table-cell text-slate-500 dark:text-slate-400">{team.goalsAgainst}</td>
                    <td className="py-3.5 px-2.5 text-center font-bold text-blue-500 dark:text-blue-400">
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td className="py-3.5 px-2.5 text-center hidden sm:table-cell font-mono text-xs text-slate-600 dark:text-slate-300">
                      {ppg}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans font-bold text-base sm:text-lg text-yellow-500 dark:text-yellow-400">
                      {team.points}
                    </td>

                    {/* Form Guide */}
                    <td className="py-3.5 px-3 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {team.form && team.form.length > 0 ? (
                          team.form.map((res, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded font-black text-[10px] flex items-center justify-center ${
                                res === 'W'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : res === 'D'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : res === 'L'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 border border-slate-300 dark:border-slate-700'
                              }`}
                              title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : res === 'L' ? 'Loss' : 'Unplayed'}
                            >
                              {res}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Legend Footer */}
          <div className="p-4 bg-slate-50 dark:bg-[#060a14] border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
                <span>Champions League #1 Seed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600/20 border border-blue-500/40" />
                <span>ECNL National Playoffs Qualification Zone (Top 3)</span>
              </div>
            </div>
            <div className="italic text-slate-500">
              * Official NorCal ECNL points system (3 pts for Win, 1 pt for Draw)
            </div>
          </div>
        </div>

        {/* Tournament Accolades & Trophies Showcase */}
        <div className="mt-14">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="font-condensed font-black text-2xl uppercase text-slate-900 dark:text-white">
              Major Tournament Championships & Honors
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#090e1a] border border-slate-200 dark:border-slate-800 hover:border-yellow-500/40 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/50">
                      {t.placement}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.year}</span>
                  </div>

                  <h4 className="font-condensed font-black text-lg uppercase text-slate-900 dark:text-white leading-tight">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.division}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>📍 {t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
