import React, { useState } from 'react';
import { TeamInfo, Match, ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from '../types';
import { ClubCrest } from './ClubCrest';
import { ActionCarousel } from './ActionCarousel';
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
  ChevronRight,
  Tv,
  Camera
} from 'lucide-react';

interface HeroProps {
  teamInfo: TeamInfo;
  nextMatch?: Match;
  onOpenScoutPack: () => void;
  playerCount: number;
  actionPhotos?: ActionPhoto[];
  googlePhotosAlbums?: GooglePhotosAlbum[];
  masterAlbumInfo?: MasterAlbumInfo;
  onOpenPhotoManager?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  teamInfo,
  nextMatch,
  onOpenScoutPack,
  playerCount,
  actionPhotos,
  googlePhotosAlbums,
  masterAlbumInfo,
  onOpenPhotoManager,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'nextMatch'>('gallery');
  return (
    <section className="relative overflow-hidden bg-[#080c14] pt-6 pb-10 lg:pt-8 lg:pb-12 border-b border-slate-800/80">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Stadium Floodlight Visual Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-red-500 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Team Identity & Headlines */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Main Headline with Custom Athletic Typography */}
            <h1 className="font-condensed font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase text-white leading-[0.92] mb-3">
              DE ANZA <span className="text-[#00ADEF]">FORCE</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl text-slate-300 font-bold tracking-normal mt-1">
                U16 ECNL GIRLS
              </span>
            </h1>

            {/* Subtitle & Club Pedigree */}
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-5 font-normal">
              Official collegiate showcase portal for the De Anza Force U16 ECNL squad (Cupertino / Silicon Valley, CA). 
              Competing in the Elite Clubs National League Northern California Conference.
            </p>

            {/* Season Quick Stats Ribbon */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-lg p-3 rounded-xl bg-slate-900/95 border border-slate-800 shadow-md mb-6">
              <div className="text-center border-r border-slate-800 pr-2">
                <div className="font-condensed font-black text-xl sm:text-2xl text-white">
                  {teamInfo.seasonRecord.wins}-{teamInfo.seasonRecord.losses}-{teamInfo.seasonRecord.draws}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Record
                </div>
              </div>

              <div className="text-center border-r border-slate-800 pr-2">
                <div className="font-condensed font-black text-xl sm:text-2xl text-blue-400">
                  +{teamInfo.seasonRecord.goalsFor - teamInfo.seasonRecord.goalsAgainst}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Goal Diff
                </div>
              </div>

              <div className="text-center border-r border-slate-800 pr-2">
                <div className="font-condensed font-black text-xl sm:text-2xl text-emerald-400">
                  {teamInfo.seasonRecord.cleanSheets}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Clean Sheets
                </div>
              </div>

              <div className="text-center">
                <div className="font-condensed font-black text-xl sm:text-2xl text-amber-400">
                  #{teamInfo.seasonRecord.norcalRank}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  NorCal Rank
                </div>
              </div>
            </div>

            {/* Focused Action Buttons */}
            <div className="flex items-center gap-3">
              <a
                href="#roster"
                id="hero-roster-cta"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-condensed font-black text-base uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md transition-all cursor-pointer border border-blue-400/30"
              >
                <span>View Roster</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                href="#schedule"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-condensed font-bold text-sm uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 transition-all"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Match Schedule</span>
              </a>
            </div>
          </div>

          {/* Right Column: Action Photo Carousel & Next Match Spotlight */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Action Carousel Section */}
            <div className="relative">
              {/* The Carousel */}
              <ActionCarousel 
                photos={actionPhotos}
                albums={googlePhotosAlbums}
                masterAlbumInfo={masterAlbumInfo}
                onOpenPhotoManager={onOpenPhotoManager}
              />
            </div>

            {/* Next Matchday Quick Spotlight */}
            {nextMatch && (
              <div className="relative rounded-2xl bg-gradient-to-b from-[#11192e] to-[#0a0f1d] border border-blue-900/50 p-3.5 shadow-md overflow-hidden group">
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-condensed font-black text-xs uppercase tracking-wider text-red-400">
                      NEXT FIXTURE SPOTLIGHT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
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
                    <div className="font-condensed font-black text-base sm:text-lg text-white uppercase truncate flex items-center gap-2 flex-wrap">
                      <span>
                        De Anza Force{' '}
                        <span className={nextMatch.isHome ? 'text-slate-400' : 'text-amber-400 font-black'}>
                          {nextMatch.isHome ? 'vs' : 'at'}
                        </span>{' '}
                        {nextMatch.opponent}
                      </span>
                      <span className={`text-[11px] font-condensed font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        nextMatch.isHome 
                          ? 'bg-blue-950/90 text-[#00ADEF] border border-blue-800/80 shadow-xs' 
                          : 'bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow-xs'
                      }`}>
                        {nextMatch.isHome ? 'HOME' : 'AWAY'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {nextMatch.date} • {nextMatch.time}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{nextMatch.venue}</span>
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
                        className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition-colors"
                        title="Live Stream"
                      >
                        <Tv className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={nextMatch.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-white border border-slate-700 transition-colors"
                      title="GPS Directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
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
