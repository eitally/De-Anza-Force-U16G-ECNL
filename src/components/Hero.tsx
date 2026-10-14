import React from 'react';
import { TeamInfo, Match } from '../types';
import { InstagramPostData } from './InstagramFeaturedPost';
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Printer, 
  ChevronRight, 
  TrendingUp,
  Tv,
  Navigation,
  Users
} from 'lucide-react';

interface HeroProps {
  isAdminMode?: boolean;
  teamInfo: TeamInfo;
  nextMatch?: Match;
  onOpenScoutPack: () => void;
  playerCount: number;
  featuredInstagramPost?: InstagramPostData;
  onSaveFeaturedInstagramPost?: (post: InstagramPostData) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  teamInfo,
  nextMatch,
  onOpenScoutPack,
  playerCount,
}) => {
  const goalDiff = teamInfo.seasonRecord 
    ? teamInfo.seasonRecord.goalsFor - teamInfo.seasonRecord.goalsAgainst 
    : 0;

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#080c14] pt-6 pb-10 lg:pt-8 lg:pb-12 border-b border-slate-200 dark:border-slate-800/80">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Stadium Floodlight Visual Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Team Identity, Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* League & Classification Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 text-[#00ADEF] text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" />
                Girls ECNL Northern California
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Class of 2028 / 2029
              </span>
            </div>

            {/* Main Headline with Custom Athletic Typography */}
            <h1 className="font-condensed font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase text-slate-900 dark:text-white leading-[0.92] mb-3">
              DE ANZA <span className="text-[#00ADEF]">FORCE</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-slate-600 dark:text-slate-300 font-bold tracking-normal mt-1">
                U16 ECNL GIRLS
              </span>
            </h1>

            {/* Subtitle & Club Pedigree */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-6 font-normal">
              Official collegiate recruitment & showcase portal for the De Anza Force U16 ECNL squad (Cupertino &amp; Silicon Valley, CA). 
              Competing in the Elite Clubs National League Northern California Conference.
            </p>

            {/* High-Intent Direct Action CTAs */}
            <div className="flex items-center gap-3 flex-wrap mb-6 w-full sm:w-auto">
              <a
                href="#roster"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#00ADEF]" />
                <span>View Squad ({playerCount} Players)</span>
              </a>

              <button
                type="button"
                onClick={onOpenScoutPack}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#00ADEF] hover:bg-[#0098d3] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Scouting Pack (Print)</span>
              </button>

              <a
                href="#schedule"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <span>Fixtures</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Season Metrics Summary Strip */}
            <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Record</span>
                <span className="font-condensed font-black text-sm text-slate-900 dark:text-white tabular-nums">
                  {teamInfo.seasonRecord.wins}W - {teamInfo.seasonRecord.losses}L - {teamInfo.seasonRecord.draws}D
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Goal Diff</span>
                <span className="font-condensed font-black text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {goalDiff > 0 ? `+${goalDiff}` : goalDiff} GD
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Goals Scored</span>
                <span className="font-condensed font-black text-sm text-slate-900 dark:text-white tabular-nums">
                  {teamInfo.seasonRecord.goalsFor} GF
                </span>
              </div>
              <div className="hidden sm:block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Home Base</span>
                <span className="font-condensed font-black text-sm text-slate-900 dark:text-white truncate">
                  Silicon Valley
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Next Fixture Spotlight & Recent Form */}
          <div className="lg:col-span-5 flex flex-col gap-4 w-full">
            {/* Next Match Spotlight */}
            {nextMatch && (
              <div className="relative w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-4 shadow-md overflow-hidden group">
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-sans font-black text-xs uppercase tracking-wider text-red-400">
                      NEXT FIXTURE SPOTLIGHT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {nextMatch.competition}
                    </span>
                    <a
                      href="#schedule"
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    >
                      <span>Fixtures</span>
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Opponent & Match Header */}
                  <div>
                    <div className="font-sans font-bold text-lg sm:text-xl text-slate-900 dark:text-white uppercase truncate flex items-center gap-2 flex-wrap">
                      <span>
                        De Anza Force{' '}
                        <span className={nextMatch.isHome ? 'text-slate-500 dark:text-slate-400' : 'text-amber-400 font-black'}>
                          {nextMatch.isHome ? 'vs' : 'at'}
                        </span>{' '}
                        {nextMatch.opponent}
                      </span>
                      <span className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        nextMatch.isHome
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-[#00ADEF] border border-blue-200 dark:border-blue-800 shadow-xs'
                          : 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                      }`}>
                        {nextMatch.isHome ? 'HOME' : 'AWAY'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {nextMatch.date} • {nextMatch.time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <a 
                          href={nextMatch.mapUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="truncate hover:text-blue-400 hover:underline"
                        >
                          {nextMatch.venue}
                        </a>
                      </span>
                    </div>
                  </div>

                  {/* Quick Venue / Live Stream Links */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <a
                      href={nextMatch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-blue-500 dark:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Field Directions</span>
                    </a>
                    {nextMatch.videoLiveStreamUrl && (
                      <a
                        href={nextMatch.videoLiveStreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-600 dark:text-red-300 hover:text-white text-xs font-bold border border-red-500/30 transition-colors"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Watch Live</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Form Widget */}
            {teamInfo.recentForm && teamInfo.recentForm.length > 0 && (
              <div className="relative w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-4 shadow-md overflow-hidden">
                <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Recent Match Form
                    </span>
                  </div>
                  {teamInfo.recentFormStat && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {teamInfo.recentFormStat}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {teamInfo.recentForm.map((result, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black shadow-xs ${
                        result === 'W' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' :
                        result === 'D' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' :
                        result === 'L' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                  <div className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Last {teamInfo.recentForm.length} Matches
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
