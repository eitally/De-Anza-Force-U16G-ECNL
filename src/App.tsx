/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, TEAM_DATA_DOC } from './lib/firebase';
import { onSnapshot, setDoc, getDoc } from 'firebase/firestore';
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

export default function App() {
  // Load data from localStorage or initialize with default sample data
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);

  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);

  const [standings, setStandings] = useState<StandingTeam[]>(INITIAL_STANDINGS);

  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);

  const [teamInfo, setTeamInfo] = useState<TeamInfo>(INITIAL_TEAM_INFO);

  // Media States
  const [actionPhotos, setActionPhotos] = useState<ActionPhoto[]>(DEFAULT_ACTION_PHOTOS);

  const [googlePhotosAlbums, setGooglePhotosAlbums] = useState<GooglePhotosAlbum[]>(DEFAULT_GOOGLE_PHOTOS_ALBUMS);

  const [masterAlbumInfo, setMasterAlbumInfo] = useState<MasterAlbumInfo>(DEFAULT_MASTER_ALBUM_INFO);

  // UI Modal States
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isScoutPackOpen, setIsScoutPackOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<EditorTab>('players');
  const [initialEditingPlayer, setInitialEditingPlayer] = useState<Player | null>(null);
  const [initialEditingCoach, setInitialEditingCoach] = useState<Coach | null>(null);

  // Firebase real-time data sync
  useEffect(() => {
    const unsubscribe = onSnapshot(TEAM_DATA_DOC, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.players) setPlayers(data.players);
        if (data.matches) setMatches(data.matches);
        if (data.standings) setStandings(data.standings);
        if (data.coaches) setCoaches(data.coaches);
        if (data.teamInfo) setTeamInfo(data.teamInfo);
        if (data.actionPhotos) setActionPhotos(data.actionPhotos);
        if (data.googlePhotosAlbums) setGooglePhotosAlbums(data.googlePhotosAlbums);
        if (data.masterAlbumInfo) setMasterAlbumInfo(data.masterAlbumInfo);
      } else {
        // If no data, initialize it
        setDoc(TEAM_DATA_DOC, {
          players: INITIAL_PLAYERS,
          matches: INITIAL_MATCHES,
          standings: INITIAL_STANDINGS,
          coaches: INITIAL_COACHES,
          teamInfo: INITIAL_TEAM_INFO,
          actionPhotos: DEFAULT_ACTION_PHOTOS,
          googlePhotosAlbums: DEFAULT_GOOGLE_PHOTOS_ALBUMS,
          masterAlbumInfo: DEFAULT_MASTER_ALBUM_INFO
        });
      }
    }, (error) => {
      console.error("Firestore listener error:", error);
    });

    return () => unsubscribe();
  }, []);

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
    setDoc(TEAM_DATA_DOC, { players: updated }, { merge: true });
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
    setDoc(TEAM_DATA_DOC, { matches: updated }, { merge: true });
    
    // Automatically recalculate and sync De Anza Force standings and team season record from match schedule
    const synced = syncStandingsAndTeamInfoWithMatches(updated, standings, teamInfo);
    setStandings(synced.updatedStandings);
    setTeamInfo(synced.updatedTeamInfo);
    setDoc(TEAM_DATA_DOC, { 
      standings: synced.updatedStandings, 
      teamInfo: synced.updatedTeamInfo 
    }, { merge: true });
  };

  const handleSaveStandings = (updated: StandingTeam[]) => {
    setStandings(updated);
    setDoc(TEAM_DATA_DOC, { standings: updated }, { merge: true });
  };

  const handleSaveCoaches = (updated: Coach[]) => {
    setCoaches(updated);
    setDoc(TEAM_DATA_DOC, { coaches: updated }, { merge: true });
  };

  const handleSaveTeamInfo = (updated: TeamInfo) => {
    setTeamInfo(updated);
    setDoc(TEAM_DATA_DOC, { teamInfo: updated }, { merge: true });
  };

  const handleSaveActionPhotos = (updated: ActionPhoto[]) => {
    setActionPhotos(updated);
    setDoc(TEAM_DATA_DOC, { actionPhotos: updated }, { merge: true });
  };

  const handleSaveGooglePhotosAlbums = (updated: GooglePhotosAlbum[]) => {
    setGooglePhotosAlbums(updated);
    setDoc(TEAM_DATA_DOC, { googlePhotosAlbums: updated }, { merge: true });
  };

  const handleSaveMasterAlbumInfo = (updated: MasterAlbumInfo) => {
    setMasterAlbumInfo(updated);
    setDoc(TEAM_DATA_DOC, { masterAlbumInfo: updated }, { merge: true });
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
    
    setDoc(TEAM_DATA_DOC, {
      players: INITIAL_PLAYERS,
      matches: INITIAL_MATCHES,
      standings: INITIAL_STANDINGS,
      coaches: INITIAL_COACHES,
      teamInfo: INITIAL_TEAM_INFO,
      actionPhotos: DEFAULT_ACTION_PHOTOS,
      googlePhotosAlbums: DEFAULT_GOOGLE_PHOTOS_ALBUMS,
      masterAlbumInfo: DEFAULT_MASTER_ALBUM_INFO
    });
  };

  // Find next upcoming match
  const nextMatch = matches.find((m) => m.status === 'upcoming') || matches[0];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white dark:selection:text-white">
      
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
                className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-blue-600 transition-colors"
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
            key="player-modal"
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
            key="team-editor-modal"
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
