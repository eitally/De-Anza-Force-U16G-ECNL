import React, { useState } from 'react';
import { TeamInfo, Match, ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from '../types';
import { ClubCrest } from './ClubCrest';
import { ActionCarousel } from './ActionCarousel';
import { InstagramPostData } from './InstagramFeaturedPost';
import { 
  Trophy, 
  Shield, 
  MapPin, 
  Clock, 
  Calendar, 
  Sparkles, 
  ArrowDown, 
  FileText, 
  Award, 
  Navigation,
  Sliders,
  ChevronRight, TrendingUp,
  Tv,
  Camera
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
  isAdminMode = false, 
  teamInfo,
  nextMatch,
  onOpenScoutPack,
  playerCount,
  featuredInstagramPost,
  onSaveFeaturedInstagramPost,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'nextMatch'>('gallery');
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#080c14] pt-6 pb-10 lg:pt-8 lg:pb-12 border-b border-slate-200 dark:border-slate-800/80">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Stadium Floodlight Visual Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-stretch">
          
          {/* Left Column: Team Identity & Headlines */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Main Headline with Custom Athletic Typography */}
            <h1 className="font-condensed font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase text-slate-900 dark:text-white leading-[0.92] mb-3">
              DE ANZA <span className="text-[#00ADEF]">FORCE</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-slate-600 dark:text-slate-300 font-bold tracking-normal mt-1">
                U16 ECNL GIRLS
              </span>
            </h1>

            {/* Subtitle & Club Pedigree */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-5 font-normal">
              Official collegiate showcase portal for the De Anza Force U16 ECNL squad (Cupertino / Silicon Valley, CA). 
              Competing in the Elite Clubs National League Northern California Conference.
            </p>



            {/* Next Matchday Quick Spotlight */}
            {nextMatch && (
              <div className="relative w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-3.5 shadow-md overflow-hidden group">
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-red-400">
                      NEXT FIXTURE SPOTLIGHT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                      {nextMatch.competition}
                    </span>
                    <a
                      href="#schedule"
                      className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    >
                      <span>All Fixtures</span>
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white uppercase truncate flex items-center gap-2 flex-wrap">
                      <span>
                        De Anza Force{' '}
                        <span className={nextMatch.isHome ? 'text-slate-500 dark:text-slate-400' : 'text-amber-400 font-black'}>
                          {nextMatch.isHome ? 'vs' : 'at'}
                        </span>{' '}
                        {nextMatch.opponent}
                      </span>
                      <span className={`text-[11px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        nextMatch.isHome
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-[#00ADEF] border border-blue-200 dark:border-blue-800 shadow-xs'
                          : 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                      }`}>
                        {nextMatch.isHome ? 'HOME' : 'AWAY'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {nextMatch.date} • {nextMatch.time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <a href={nextMatch.mapUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-400 hover:underline">{nextMatch.venue}</a>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {nextMatch.videoLiveStreamUrl && (
                      <a
                        href={nextMatch.videoLiveStreamUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-slate-900 dark:hover:text-white border border-red-500/40 transition-colors"
                        title="Live Stream"
                      >
                        <Tv className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={nextMatch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors"
                      title="GPS Directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Form Widget */}
            {teamInfo.recentForm && teamInfo.recentForm.length > 0 && (
              <div className="relative w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-3.5 shadow-md overflow-hidden group mt-4">
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Recent Form
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
                      className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black shadow-sm ${
                        result === 'W' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' :
                        result === 'D' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' :
                        result === 'L' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                  <div className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
                    Last {teamInfo.recentForm.length} Matches
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Action Photo Carousel & Next Match Spotlight */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:h-full">
            {/* Action Carousel Section */}
            <div className="relative lg:h-full flex flex-col">
              {/* The Carousel */}
              <ActionCarousel 
                className="lg:h-full flex flex-col flex-1" 
                isAdminMode={isAdminMode} 
                post={featuredInstagramPost}
                onSavePost={onSaveFeaturedInstagramPost}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
