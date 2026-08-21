import React from 'react';
import { Player } from '../types';
import { getSafeImageSrc, handleImageError, DEFAULT_PLAYER_PHOTO } from '../utils/imageUtils';
import { 
  GraduationCap, 
  Video, 
  Star, 
  Award, 
  ExternalLink, 
  Edit3, 
  Shield, 
  Sparkles, 
  UserCheck,
  FileDown,
  Instagram
} from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onSelectPlayer: (player: Player) => void;
  onEditPlayer?: (player: Player) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onSelectPlayer,
  onEditPlayer,
}) => {
  const getPositionBadgeStyle = (pos: string) => {
    switch (pos) {
      case 'Forward':
        return 'bg-red-950/70 text-red-300 border-red-600/50';
      case 'Midfielder':
        return 'bg-blue-950/70 text-blue-300 border-blue-600/50';
      case 'Defender':
        return 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-600/50';
      case 'Goalkeeper':
        return 'bg-amber-950/70 text-amber-300 border-amber-600/50';
      default:
        return 'bg-blue-950/70 text-blue-300 border-blue-600/50';
    }
  };

  const safePhotoSrc = getSafeImageSrc(player.photoUrl, DEFAULT_PLAYER_PHOTO);

  return (
    <div
      onClick={() => onSelectPlayer(player)}
      className="group relative flex flex-col rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#101726] dark:to-[#0a0e1a] border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/60 shadow-lg hover:shadow-2xl hover:shadow-blue-950/50 transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      {/* Top Card Image & Jersey Number Area */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-50 dark:bg-[#0c1220] overflow-hidden">
        {/* Atmospheric Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101726] via-transparent to-transparent z-10" />

        {/* Player Image with Fallback */}
        <img
          key={`${player.id}_${safePhotoSrc}`}
          src={safePhotoSrc}
          alt={player.name}
          className="w-full h-full object-cover object-top filter contrast-105 brightness-95 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
        />

        {/* Jersey Number Shield Badge (Top Left) - Ultra Legible Athletic Font */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950/95 backdrop-blur-md border-2 border-red-500 shadow-2xl flex items-center justify-center min-w-[40px]">
            <span className="font-display font-bold text-xl sm:text-2xl text-black dark:text-white leading-none tracking-normal drop-shadow-md">
              #{player.jerseyNumber}
            </span>
          </div>

          {player.isCaptain && (
            <span className="px-2 py-1 rounded-lg bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 border border-amber-300">
              <Star className="w-3 h-3 fill-black text-black" />
              <span>CAPTAIN</span>
            </span>
          )}
        </div>

        {/* Position Overlay (Bottom of Image) */}
        <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border backdrop-blur-md ${getPositionBadgeStyle(
              player.primaryPosition
            )}`}
          >
            {player.specificPosition}
          </span>
        </div>
      </div>

      {/* Card Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Player Name */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-condensed font-black text-xl sm:text-2xl uppercase text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {player.name}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {(player.profilePdfUrl || player.profileDocUrl) && (
                <a
                  href={player.profilePdfUrl || player.profileDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-700 dark:text-blue-300 hover:text-white px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-600 border border-blue-200 dark:border-blue-700/60 transition-all flex items-center gap-1 text-[11px] font-bold shadow"
                  title="Download Player Profile PDF"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-300" />
                  <span>PDF</span>
                </a>
              )}
              {player.highlightsUrl && (
                <span 
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" 
                  title="Highlight Video Available"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(player.highlightsUrl, '_blank');
                  }}
                >
                  <Video className="w-4 h-4" />
                </span>
              )}
              {player.instagram && (
                <span 
                  className="text-pink-500 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" 
                  title="Instagram Profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(player.instagram, '_blank');
                  }}
                >
                  <Instagram className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          {/* High School, Academic & Physical Stats */}
          <div className="mt-1.5 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 line-clamp-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{player.highSchool}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[11px] pt-0.5">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {player.height} • {player.dominantFoot === 'Both' ? 'Both Feet' : `${player.dominantFoot}-Foot`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">
                <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                GPA: {player.gpa}
              </span>

              {player.commitment !== 'Uncommitted' ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                  {player.commitment}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Class of {player.gradYear}
                </span>
              )}
            </div>
          </div>

          {/* Bio Preview */}
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {player.bio}
          </p>
        </div>
      </div>
    </div>
  );
};
