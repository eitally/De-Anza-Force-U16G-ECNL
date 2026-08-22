import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Player, TeamInfo, Coach } from '../types';
import { getSafeImageSrc, handleImageError, DEFAULT_PLAYER_PHOTO, compressHeadshot } from '../utils/imageUtils';
import { 
  X, 
  GraduationCap, 
  Video, 
  Award, 
  Mail, 
  Phone, 
  Shield, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  Sliders,
  Calendar,
  MapPin,
  FileDown,
  Trash2,
  Instagram,
  Camera,
  Upload
} from 'lucide-react';

interface PlayerModalProps {
  player: Player | null;
  teamInfo: TeamInfo;
  coaches: Coach[];
  onClose: () => void;
  onEditPlayer?: (player: Player) => void;
  onDeletePlayer?: (playerId: string, playerName: string) => void;
  onUpdatePlayerPhoto?: (playerId: string, photoUrl: string) => void;
  isAdminMode?: boolean;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  teamInfo,
  coaches,
  onClose,
  onEditPlayer,
  onDeletePlayer,
  onUpdatePlayerPhoto,
  isAdminMode = false,
}) => {
  if (!player) return null;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photoSavedNotice, setPhotoSavedNotice] = useState<string | null>(null);
  const recruitingCoach = coaches && coaches.length > 0 ? (coaches.find(c => (c.role || '').toLowerCase().includes('recruiting')) || coaches[0]) : null;
  const safePhotoSrc = getSafeImageSrc(player.photoUrl, DEFAULT_PLAYER_PHOTO);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdatePlayerPhoto) return;

    compressHeadshot(file)
      .then((res) => {
        onUpdatePlayerPhoto(player.id, res);
        setPhotoSavedNotice('✓ Photo saved to database!');
        setTimeout(() => setPhotoSavedNotice(null), 3500);
      })
      .catch((err) => {
        console.error("Photo compression failed:", err);
        alert("Failed to process photo file. Please try a smaller image.");
      });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0b101d] border border-blue-900/60 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-red-500 to-blue-600 shrink-0" />
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Top Profile Summary Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch pb-6 border-b border-slate-200 dark:border-slate-800">
            {/* Player Photo with Jersey Badge */}
            <div className="md:col-span-4 relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#090d16] border border-blue-800/40 shadow-xl w-full h-64 sm:h-80 md:aspect-auto md:h-full group">
              <img
                key={`${player.id}_${safePhotoSrc}`}
                src={safePhotoSrc}
                alt={player.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
              />
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/95 border-2 border-red-500 text-black dark:text-white font-display font-bold text-2xl sm:text-3xl shadow-2xl">
                #{player.jerseyNumber}
              </div>
              {player.isCaptain && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1 border border-amber-300">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span>CAPTAIN</span>
                </div>
              )}

              {/* Direct Photo Upload Button for Admins */}
              {onUpdatePlayerPhoto && (
                <label className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}

              {/* Photo Saved Notification */}
              {photoSavedNotice && (
                <div className="absolute inset-x-3 bottom-14 p-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-center text-xs font-bold shadow-2xl animate-in fade-in">
                  {photoSavedNotice}
                </div>
              )}
            </div>

            {/* Core Info & College Credentials */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                    {player.primaryPosition}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    Class of {player.gradYear} • {player.ageGroup || 'U16 ECNL'}
                  </span>
                  {player.commitment !== 'Uncommitted' ? (
                    <span className="px-3 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500">
                      ★ Committed: {player.commitment}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-red-950/80 text-red-300 border border-red-700">
                      Uncommitted
                    </span>
                  )}
                </div>

                <h2 className="font-condensed font-black text-3xl sm:text-5xl uppercase text-black dark:text-white tracking-tight leading-tight">
                  {player.name}
                </h2>

                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-2">
                  <span>{player.highSchool}</span>
                  {player.hometown && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {player.hometown}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Bio Description */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-[#0c1220] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                {player.bio}
              </p>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">Height / Wt</div>
                  <div className="font-condensed font-black text-lg text-slate-900 dark:text-white">
                    {player.height} {player.weight ? `• ${player.weight}` : ''}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">Dominant Foot</div>
                  <div className="font-condensed font-black text-lg text-slate-900 dark:text-white">{player.dominantFoot}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">GPA</div>
                  <div className="font-condensed font-black text-lg text-blue-400">{player.gpa}</div>
                </div>
                <div className="col-span-2 p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold">Player Contact</div>
                  <div className="font-bold text-[11px] text-slate-700 dark:text-slate-200 mt-1 truncate">
                    {player.contactEmail ? (
                      <a href={`mailto:${player.contactEmail}`} className="text-blue-400 hover:underline">
                        {player.contactEmail}
                      </a>
                    ) : (
                      'Via Coach'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Season Statistics Showcase */}
          <div>
            <h3 className="font-condensed font-black text-lg uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              2026/2027 Season Performance Stats
            </h3>
            
            {(!player.stats.appearances && !player.stats.starts && !player.stats.goals && !player.stats.assists && !player.stats.cleanSheets && !player.stats.saves) ? (
              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed text-center">
                <Shield className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Pre-season / Stats Pending</p>
                <p className="text-xs text-slate-500 mt-1">Player statistics have not been recorded yet.</p>
              </div>
            ) : player.primaryPosition === 'Goalkeeper' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">{player.stats.appearances}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Matches Played</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-emerald-400">{player.stats.cleanSheets || 0}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Clean Sheets</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-blue-400">{player.stats.saves || 0}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Saves Recorded</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">{player.stats.appearances}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Matches Played</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-cyan-400">{player.stats.starts ?? player.stats.appearances}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Match Starts</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-blue-400">{player.stats.goals}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Goals Scored</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="font-condensed font-black text-3xl sm:text-4xl text-red-400">{player.stats.assists}</div>
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mt-1">Assists</div>
                </div>
              </div>
            )}
          </div>

          {/* Accolades & Secondary Positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Awards & Honors */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
              <h4 className="font-condensed font-black text-base uppercase text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-400" />
                Player Honors & Accolades
              </h4>
              
              {player.awards && player.awards.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {player.awards.map((award, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{award}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic mt-3">No honors or accolades listed yet.</p>
              )}
            </div>

            {/* Highlight Reel & Recruitment Links */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-condensed font-black text-base uppercase text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-400" />
                  Video Highlight Reels & Profile Documents
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Match tape, tactical film breakdown, and player scouting profile available for college coaching staffs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(player.profilePdfUrl || player.profileDocUrl) && (
                  <a
                    href={player.profilePdfUrl || player.profileDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Profile PDF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {player.highlightsUrl && (
                  <a
                    href={player.highlightsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Watch Highlight Video</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {player.instagram && (
                  <a
                    href={player.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 hover:opacity-90 text-white font-bold text-xs shadow-md transition-opacity"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                
              </div>
            </div>
          </div>

          {/* Quick Coach Contact Footer */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#090d16] border border-blue-950 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>College Recruiting Liaison: <strong className="text-slate-900 dark:text-white">{recruitingCoach?.name}</strong></span>
              {recruitingCoach && (
                <a
                  href={`mailto:${recruitingCoach.email}?subject=College Scouting Inquiry: ${player.name} (#${player.jerseyNumber}) - De Anza Force U16 ECNL`}
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Liaison</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onDeletePlayer && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Player</span>
                </button>
              )}

              {onEditPlayer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditPlayer(player);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Delete Confirmation Overlay */}
          {confirmDelete && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
            >
              <div 
                className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1627] border border-red-500/50 p-6 shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 text-red-400">
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/30 text-red-400">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">Remove Player</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Confirm roster deletion</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to permanently remove <strong className="text-black dark:text-white">#{player.jerseyNumber} {player.name}</strong> from the official team roster?
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeletePlayer) {
                        onDeletePlayer(player.id, player.name);
                      }
                      setConfirmDelete(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-colors"
                  >
                    Yes, Remove Player
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};
