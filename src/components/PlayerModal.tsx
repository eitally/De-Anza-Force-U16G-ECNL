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
  Upload,
  Play,
  Copy,
  Check
} from 'lucide-react';

export type PlayerModalTab = 'overview' | 'stats' | 'video' | 'academics';

function getVideoEmbed(url?: string): { type: 'youtube' | 'vimeo' | 'veo' | 'hudl' | 'generic'; embedUrl?: string; directUrl: string } | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // YouTube (supports watch?v=, youtu.be/, shorts/, embed/)
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      directUrl: trimmed
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      directUrl: trimmed
    };
  }

  // Veo
  if (trimmed.includes('app.veo.co/matches/')) {
    const embedVeo = trimmed.replace(/\/$/, '') + '/embed/';
    return {
      type: 'veo',
      embedUrl: embedVeo,
      directUrl: trimmed
    };
  }

  return {
    type: trimmed.includes('hudl') ? 'hudl' : 'generic',
    directUrl: trimmed
  };
}

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
  const [activeTab, setActiveTab] = useState<PlayerModalTab>('overview');
  const [copiedNcaa, setCopiedNcaa] = useState(false);
  const recruitingCoach = coaches && coaches.length > 0 ? (coaches.find(c => (c.role || '').toLowerCase().includes('recruiting')) || coaches[0]) : null;
  const safePhotoSrc = getSafeImageSrc(player.photoUrl, DEFAULT_PLAYER_PHOTO);
  const videoEmbed = getVideoEmbed(player.highlightsUrl);

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

          {/* Navigation Tabs Bar for Instant Mobile & Desktop Exploration */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-[#070b14] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Bio & Accolades</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Match Stats</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Game Film & Video</span>
              {player.highlightsUrl && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('academics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'academics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academics & NCAA</span>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & BIO */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-condensed font-black text-base uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-blue-400" />
                  <span>Scouting Report & Player Evaluation</span>
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {player.bio || `${player.name} is a dedicated athlete competing in ECNL Northern California for De Anza Force.`}
                </p>

                {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Secondary Positions:</span>
                    {player.secondaryPositions.map((sec, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        {sec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Awards & Accolades */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <h4 className="font-condensed font-black text-base uppercase text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Honors, Accolades & Selection Honors</span>
                </h4>
                
                {player.awards && player.awards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {player.awards.map((award, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{award}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No honors or accolades recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MATCH STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                <h4 className="font-condensed font-black text-base uppercase text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>2026/2027 Season Performance Metrics</span>
                </h4>

                {(!player.stats.appearances && !player.stats.starts && !player.stats.goals && !player.stats.assists && !player.stats.cleanSheets && !player.stats.saves) ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed text-center">
                    <Shield className="w-8 h-8 text-slate-500 mb-2 opacity-50" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Stats Pending Confirmation</p>
                    <p className="text-xs text-slate-500 mt-1">Matchday statistics are verified by the coaching staff after each league weekend.</p>
                  </div>
                ) : player.primaryPosition === 'Goalkeeper' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-slate-900 dark:text-white">{player.stats.appearances}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Matches Played</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-emerald-400">{player.stats.cleanSheets || 0}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Clean Sheets</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-[#00ADEF]">{player.stats.saves || 0}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Saves Recorded</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-slate-900 dark:text-white">{player.stats.appearances}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Matches Played</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-cyan-400">{player.stats.starts ?? player.stats.appearances}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Match Starts</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-[#00ADEF]">{player.stats.goals}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Goals Scored</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
                      <div className="font-condensed font-black text-4xl text-red-400">{player.stats.assists}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Assists</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VIDEO & HIGHLIGHTS */}
          {activeTab === 'video' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-condensed font-black text-base uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-500" />
                    <span>Collegiate Scouting Tape & Match Highlights</span>
                  </h4>

                  {player.highlightsUrl && (
                    <a
                      href={player.highlightsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-400 font-bold inline-flex items-center gap-1"
                    >
                      <span>Open External Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Embedded Video Player */}
                {videoEmbed?.embedUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video relative shadow-2xl">
                    <iframe
                      src={videoEmbed.embedUrl}
                      title={`${player.name} Video Highlights`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                ) : videoEmbed?.type === 'hudl' ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-orange-950/40 border border-orange-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                        <Play className="w-6 h-6 fill-orange-400" />
                      </div>
                      <div>
                        <h5 className="font-condensed font-black text-lg uppercase text-white">
                          Verified Hudl Video Profile
                        </h5>
                        <p className="text-xs text-slate-400">
                          Collegiate match tape and isolated player clips on Hudl
                        </p>
                      </div>
                    </div>

                    <a
                      href={videoEmbed.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-condensed font-black text-xs uppercase tracking-wider shadow-lg shrink-0 inline-flex items-center gap-1.5"
                    >
                      <span>Watch Reel on Hudl</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed text-center space-y-2">
                    <Video className="w-8 h-8 text-slate-500 opacity-50" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Highlight Film Available Upon Request</p>
                    <p className="text-xs text-slate-500 max-w-md">
                      College coaches may request full unedited match footage and showcase film via our recruiting coordinator.
                    </p>
                    {recruitingCoach && (
                      <a
                        href={`mailto:${recruitingCoach.email}?subject=Game Film Request: ${player.name} (#${player.jerseyNumber})`}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Request Match Film</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMICS & NCAA */}
          {activeTab === 'academics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-condensed font-black text-base uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Academic Credentials & Eligibility</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Cumulative GPA</div>
                    <div className="font-condensed font-black text-3xl text-emerald-400">{player.gpa}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Collegiate Honors Tier</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">High School</div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{player.highSchool}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Class of {player.gradYear}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">NCAA Eligibility ID</div>
                      <div className="font-mono font-bold text-sm text-[#00ADEF]">{player.ncaaId || 'Registered / Pending'}</div>
                    </div>
                    {player.ncaaId && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(player.ncaaId || '');
                          setCopiedNcaa(true);
                          setTimeout(() => setCopiedNcaa(false), 2500);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-400 cursor-pointer"
                      >
                        {copiedNcaa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedNcaa ? 'Copied to Clipboard!' : 'Copy NCAA ID'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Flyer PDF Button */}
                {(player.profilePdfUrl || player.profileDocUrl) && (
                  <div className="pt-2 flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Official Player Profile Flyer (PDF)</div>
                      <div className="text-[11px] text-slate-500">Download printable scout flyer with full verified transcript summary</div>
                    </div>
                    <a
                      href={player.profilePdfUrl || player.profileDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

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
