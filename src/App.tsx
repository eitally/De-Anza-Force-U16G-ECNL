/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Player, Match, StandingTeam, Coach, TeamInfo, ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from './types';
import { 
  INITIAL_PLAYERS, 
  INITIAL_MATCHES, 
  INITIAL_STANDINGS, 
  INITIAL_COACHES, 
  INITIAL_TEAM_INFO, 
  INITIAL_TOURNAMENTS,
  DEFAULT_ACTION_PHOTOS,
  DEFAULT_GOOGLE_PHOTOS_ALBUMS,
  DEFAULT_MASTER_ALBUM_INFO
} from './data/defaultData';
import { syncStandingsAndTeamInfoWithMatches } from './utils/recordUtils';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RosterSection } from './components/RosterSection';
import { PlayerModal } from './components/PlayerModal';
import { ScheduleSection } from './components/ScheduleSection';
import { StandingsSection } from './components/StandingsSection';
import { RecruitmentHub } from './components/RecruitmentHub';
import { CoachingStaff } from './components/CoachingStaff';
import { TeamEditorModal, EditorTab } from './components/TeamEditorModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PrintScoutingPack } from './components/PrintScoutingPack';
import { ClubCrest } from './components/ClubCrest';

import { 
  Shield, 
  Mail, 
  Phone, 
  Instagram, 
  Youtube, 
  ArrowUp, 
  FileText, 
  Sliders, 
  Heart,
  ChevronRight,
  Lock
} from 'lucide-react';

const STORAGE_KEYS = {
  PLAYERS: 'deanza_force_players_v2',
  MATCHES: 'deanza_force_matches_v2',
  STANDINGS: 'deanza_force_standings_v2',
  COACHES: 'deanza_force_coaches_v2',
  TEAM_INFO: 'deanza_force_team_info_v2',
  ACTION_PHOTOS: 'daf_action_photos',
  GOOGLE_PHOTOS_ALBUMS: 'daf_google_photos_albums',
  MASTER_ALBUM_INFO: 'daf_master_album_info',
};

export default function App() {
  // Load data from localStorage or initialize with default sample data
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PLAYERS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MATCHES;
  });

  const [standings, setStandings] = useState<StandingTeam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STANDINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STANDINGS;
  });

  const [coaches, setCoaches] = useState<Coach[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COACHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COACHES;
  });

  const [teamInfo, setTeamInfo] = useState<TeamInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAM_INFO);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TEAM_INFO;
  });

  // Media States
  const [actionPhotos, setActionPhotos] = useState<ActionPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTION_PHOTOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ACTION_PHOTOS;
  });

  const [googlePhotosAlbums, setGooglePhotosAlbums] = useState<GooglePhotosAlbum[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOOGLE_PHOTOS_ALBUMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_GOOGLE_PHOTOS_ALBUMS;
  });

  const [masterAlbumInfo, setMasterAlbumInfo] = useState<MasterAlbumInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTER_ALBUM_INFO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.url) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_MASTER_ALBUM_INFO;
  });

  // UI Modal States
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isScoutPackOpen, setIsScoutPackOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<EditorTab>('players');
  const [initialEditingPlayer, setInitialEditingPlayer] = useState<Player | null>(null);
  const [initialEditingCoach, setInitialEditingCoach] = useState<Coach | null>(null);

  // Admin Mode Toggle (Hide triggers from public via URL query parameter)
  const [isAdminMode, setIsAdminMode] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminMode(true);
    }
  }, []);

  const handleOpenTeamEditor = (tab: EditorTab = 'players', targetPlayer?: Player | null, targetCoach?: Coach | null) => {
    setEditorInitialTab(tab);
    setInitialEditingPlayer(targetPlayer || null);
    setInitialEditingCoach(targetCoach || null);
    
    // Check if authenticated in current session
    const isAuth = sessionStorage.getItem('daf_team_editor_auth') === 'authenticated';
    if (isAuth) {
      setIsEditorOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Sync to localStorage
  const handleSavePlayers = (updated: Player[]) => {
    setPlayers(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlayer = (playerId: string) => {
    const updated = players.filter((p) => p.id !== playerId);
    handleSavePlayers(updated);
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(null);
    }
  };

  const handleSaveMatches = (updated: Match[]) => {
    setMatches(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Automatically recalculate and sync De Anza Force standings and team season record from match schedule
    const synced = syncStandingsAndTeamInfoWithMatches(updated, standings, teamInfo);
    setStandings(synced.updatedStandings);
    setTeamInfo(synced.updatedTeamInfo);
    try {
      localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(synced.updatedStandings));
      localStorage.setItem(STORAGE_KEYS.TEAM_INFO, JSON.stringify(synced.updatedTeamInfo));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveStandings = (updated: StandingTeam[]) => {
    setStandings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.STANDINGS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCoaches = (updated: Coach[]) => {
    setCoaches(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.COACHES, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTeamInfo = (updated: TeamInfo) => {
    setTeamInfo(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.TEAM_INFO, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveActionPhotos = (updated: ActionPhoto[]) => {
    setActionPhotos(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTION_PHOTOS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('daf_media_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGooglePhotosAlbums = (updated: GooglePhotosAlbum[]) => {
    setGooglePhotosAlbums(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_PHOTOS_ALBUMS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('daf_media_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMasterAlbumInfo = (updated: MasterAlbumInfo) => {
    setMasterAlbumInfo(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.MASTER_ALBUM_INFO, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('daf_media_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetToDefaults = () => {
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setStandings(INITIAL_STANDINGS);
    setCoaches(INITIAL_COACHES);
    setTeamInfo(INITIAL_TEAM_INFO);
    setActionPhotos(DEFAULT_ACTION_PHOTOS);
    setGooglePhotosAlbums(DEFAULT_GOOGLE_PHOTOS_ALBUMS);
    setMasterAlbumInfo(DEFAULT_MASTER_ALBUM_INFO);
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYERS);
      localStorage.removeItem(STORAGE_KEYS.MATCHES);
      localStorage.removeItem(STORAGE_KEYS.STANDINGS);
      localStorage.removeItem(STORAGE_KEYS.COACHES);
      localStorage.removeItem(STORAGE_KEYS.TEAM_INFO);
      localStorage.removeItem(STORAGE_KEYS.ACTION_PHOTOS);
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_PHOTOS_ALBUMS);
      localStorage.removeItem(STORAGE_KEYS.MASTER_ALBUM_INFO);
      window.dispatchEvent(new CustomEvent('daf_media_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  // Find next upcoming match
  const nextMatch = matches.find((m) => m.status === 'upcoming') || matches[0];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-slate-900 dark:text-white">
      
      {/* Top Main Navigation */}
      <Navbar
        teamInfo={teamInfo}
        nextMatch={nextMatch}
        onOpenScoutPack={() => setIsScoutPackOpen(true)}
        playerCount={players.length}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          teamInfo={teamInfo}
          nextMatch={nextMatch}
          onOpenScoutPack={() => setIsScoutPackOpen(true)}
          playerCount={players.length}
          actionPhotos={actionPhotos}
          googlePhotosAlbums={googlePhotosAlbums}
          masterAlbumInfo={masterAlbumInfo}
          onOpenPhotoManager={isAdminMode ? () => handleOpenTeamEditor('media') : undefined}
        />

        {/* Dynamic Roster Showcase */}
        <RosterSection
          players={players}
          teamInfo={teamInfo}
          onSelectPlayer={(p) => setSelectedPlayer(p)}
          onOpenTeamPhotoEditor={isAdminMode ? () => handleOpenTeamEditor('team') : undefined}
        />

        {/* Match Schedule & Results */}
        <ScheduleSection
          matches={matches}
        />

        {/* Standings Table & Accolades */}
        <StandingsSection
          standings={standings}
          tournaments={INITIAL_TOURNAMENTS}
          onOpenEditor={isAdminMode ? () => handleOpenTeamEditor('standings') : undefined}
        />

        {/* College Recruitment Hub for Scouts */}
        {teamInfo.showRecruitmentHub && (
          <RecruitmentHub
            teamInfo={teamInfo}
            coaches={coaches}
            players={players}
            onOpenScoutPack={() => setIsScoutPackOpen(true)}
          />
        )}

        {/* Technical & Coaching Staff */}
        <CoachingStaff
          coaches={coaches}
        />
      </main>

      {/* Professional Athletic Footer */}
      <footer className="bg-slate-50 dark:bg-[#05080e] border-t border-slate-200 dark:border-slate-800/80 pt-8 pb-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            
            {/* Column 1: Brand & Crest */}
            <div className="md:col-span-5 flex flex-col items-start">
              <ClubCrest size="md" showText />
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 leading-relaxed max-w-sm">
                De Anza Force Soccer Club is one of Northern California's premier youth soccer development academies. 
                Dedicated to empowering elite student-athletes through world-class technical coaching, collegiate recruitment preparation, and national championship pathways.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="https://www.deanzaforce.org"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700"
                >
                  Official Club Portal
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="font-condensed font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <a href="#roster" className="hover:text-blue-400 transition-colors">
                    Squad Roster
                  </a>
                </li>
                <li>
                  <a href="#schedule" className="hover:text-blue-400 transition-colors">
                    Match Schedule & Livestreams
                  </a>
                </li>
                <li>
                  <a href="#standings" className="hover:text-blue-400 transition-colors">
                    ECNL NorCal Standings
                  </a>
                </li>
                <li>
                  <a href="#recruiting" className="hover:text-blue-400 transition-colors">
                    College Recruitment Liaison
                  </a>
                </li>
                <li>
                  <a href="#staff" className="hover:text-blue-400 transition-colors">
                    Coaching & Technical Staff
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Facility & Contacts */}
            <div className="md:col-span-4 space-y-2">
              <h4 className="font-condensed font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Facility & Contacts
              </h4>
              <p className="text-slate-600 dark:text-slate-300 font-semibold">{teamInfo.homeFacility}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teamInfo.homeFacility + " " + teamInfo.facilityAddress)}`} target="_blank" rel="noopener noreferrer" className="block text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:underline">{teamInfo.facilityAddress}</a>
              <div className="pt-2 text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>info@deanzaforce.org</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>(408) 555-0192</span>
                </div>
              </div>

              {/* Secure Single Team Editor Access Button */}
              {isAdminMode && (
                <div className="pt-4">
                  <button
                    id="footer-team-editor-btn"
                    onClick={() => handleOpenTeamEditor('players')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-[#00ADEF] text-xs font-bold transition-all shadow-sm group cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#00ADEF] group-hover:scale-110 transition-transform" />
                    <span>Team Editor</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Copyright Subfooter */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} De Anza Force Soccer Club U16 ECNL. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              <span>Member of ECNL Girls & US Club Soccer</span>
              <button
                onClick={scrollToTop}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-blue-600 transition-colors"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Deep-Dive Player Profile Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <PlayerModal
            player={selectedPlayer}
            teamInfo={teamInfo}
            coaches={coaches}
            onClose={() => setSelectedPlayer(null)}
          />
        )}
      </AnimatePresence>

      {/* Staff Authentication Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsEditorOpen(true);
        }}
      />

      {/* Comprehensive Team & Roster Editor Portal */}
      <AnimatePresence>
        {isEditorOpen && (
          <TeamEditorModal
            isOpen={true}
            onClose={() => {
              setIsEditorOpen(false);
              setInitialEditingPlayer(null);
              setInitialEditingCoach(null);
            }}
        teamInfo={teamInfo}
        players={players}
        matches={matches}
        standings={standings}
        coaches={coaches}
        actionPhotos={actionPhotos}
        googlePhotosAlbums={googlePhotosAlbums}
        masterAlbumInfo={masterAlbumInfo}
        onSavePlayers={handleSavePlayers}
        onSaveMatches={handleSaveMatches}
        onSaveStandings={handleSaveStandings}
        onSaveCoaches={handleSaveCoaches}
        onSaveTeamInfo={handleSaveTeamInfo}
        onSaveActionPhotos={handleSaveActionPhotos}
        onSaveGooglePhotosAlbums={handleSaveGooglePhotosAlbums}
        onSaveMasterAlbumInfo={handleSaveMasterAlbumInfo}
        onResetToDefaults={handleResetToDefaults}
        initialEditingPlayer={initialEditingPlayer}
        initialEditingCoach={initialEditingCoach}
        initialTab={editorInitialTab}
      />
        )}
      </AnimatePresence>

      {/* Printable College Scouting Roster Sheet */}
      <PrintScoutingPack
        isOpen={isScoutPackOpen}
        onClose={() => setIsScoutPackOpen(false)}
        teamInfo={teamInfo}
        players={players}
        coaches={coaches}
      />

    </div>
  );
}
