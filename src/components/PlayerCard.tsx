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
        return 'bg-slate-900/90 text-slate-200 border-slate-600/50';
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
      className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-[#101726] to-[#0a0e1a] border border-slate-800/90 hover:border-blue-500/60 shadow-lg hover:shadow-2xl hover:shadow-blue-950/50 transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      {/* Top Card Image & Jersey Number Area */}
      <div className="relative w-full h-56 sm:h-60 bg-[#0c1220] overflow-hidden">
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
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/95 backdrop-blur-md border-2 border-red-500 shadow-2xl flex items-center justify-center min-w-[40px]">
            <span className="font-display font-bold text-xl sm:text-2xl text-white leading-none tracking-normal drop-shadow-md">
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

        {/* Commitment & Class Badge (Top Right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
          {player.commitment !== 'Uncommitted' ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow">
              ★ {player.commitment}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider backdrop-blur-md">
              Class of {player.gradYear}
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

          <span className="text-[11px] font-bold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700">
            {player.height} • {player.dominantFoot === 'Both' ? 'Both Feet' : `${player.dominantFoot}-Foot`}
          </span>
        </div>
      </div>

      {/* Card Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Player Name */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-condensed font-black text-xl sm:text-2xl uppercase text-white group-hover:text-blue-400 transition-colors leading-tight">
              {player.name}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {(player.profilePdfUrl || player.profileDocUrl) && (
                <a
                  href={player.profilePdfUrl || player.profileDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-300 hover:text-white px-2 py-0.5 rounded-lg bg-blue-950/80 hover:bg-blue-600 border border-blue-700/60 transition-all flex items-center gap-1 text-[11px] font-bold shadow"
                  title="Download Player Profile PDF"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-300" />
                  <span>PDF</span>
                </a>
              )}
              {player.highlightsUrl && (
                <span 
                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-800" 
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
                  className="text-pink-400 hover:text-pink-300 p-1 rounded hover:bg-slate-800" 
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

          {/* High School & Academic Stats */}
          <div className="mt-1.5 flex flex-col gap-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 line-clamp-1">
              <span className="text-slate-300 font-medium">{player.highSchool}</span>
            </div>
            
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="inline-flex items-center gap-1 text-blue-300 font-semibold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                <GraduationCap className="w-3 h-3 text-blue-400" />
                GPA: {player.gpa}
              </span>

              {player.ncaaId && (
                <span className="text-slate-400 font-mono text-[10px]">
                  NCAA ID: {player.ncaaId}
                </span>
              )}
            </div>
          </div>

          {/* Bio Preview */}
          <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {player.bio}
          </p>
        </div>

        {/* Bottom Card Footer with Stats & Action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {/* Quick Stat */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div>
              <span className="font-bold text-white">{player.stats.appearances}</span> App
            </div>
            {player.primaryPosition === 'Goalkeeper' ? (
              <div>
                <span className="font-bold text-emerald-400">{player.stats.cleanSheets || 0}</span> CS
              </div>
            ) : (
              <>
                <div>
                  <span className="font-bold text-cyan-300">{player.stats.starts ?? player.stats.appearances}</span> Starts
                </div>
                <div>
                  <span className="font-bold text-blue-400">{player.stats.goals}</span> G
                </div>
                <div>
                  <span className="font-bold text-red-400">{player.stats.assists}</span> A
                </div>
              </>
            )}
          </div>

          {/* Inspect Button */}
          <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 inline-flex items-center gap-1 group-hover:underline">
            <span>Profile</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
