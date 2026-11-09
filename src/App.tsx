/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { saveTeamDataToServerAndCloud, fetchTeamDataFromServerAndCloud } from './lib/firebase';
import { 
  savePlayerPhotoToFirestore, 
  subscribeToPlayerPhotos, 
  sanitizeGlobalDocPayload, 
  getLocalCachedPlayerPhoto 
} from './utils/photoStore';
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
import { syncStandingsAndTeamInfoWithMatches, computeRecordAndFormFromMatches } from './utils/recordUtils';
import { enrichPlayersWithVerifiedSheet, fetchLiveRosterSheetAndEnrich } from './utils/standingsCron';
import { getValidDocumentUrl } from './utils/urlUtils';
import {
  getOfficialImgurHeadshotForPlayer,
  isLegacyOrPlaceholderHeadshot,
  OFFICIAL_SQUAD_PHOTO_URL,
  transformImageUrl,
} from './utils/imageUtils';
import {
  ECNL_DATA_API_URL,
  fetchLiveEcnlDataFromApi,
  mapEcnlApiStandings,
  mapEcnlApiSchedule,
  mergeShowcaseMatchesIntoSchedule,
  selectNextFixtureMatch,
  buildTeamInfoFromLiveEcnl,
  sortMatchesByDate,
} from './utils/ecnlApi';
import { DEFAULT_INSTAGRAM_POST, InstagramPostData } from './components/InstagramFeaturedPost';

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
import { AdminDashboard } from './components/admin/AdminDashboard';
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
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem('daf_team_players');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((p: Player) => {
            const n = (p.name || '').toLowerCase();
            return !n.includes('parker') && !n.includes('sasha') && !n.includes('anava');
          });
          const hydrated = cleaned.map((p: Player) => {
            const defaultP = INITIAL_PLAYERS.find(
              dp => dp.id === p.id || (dp.name && p.name && dp.name.trim().toLowerCase() === p.name.trim().toLowerCase())
            );
            const officialImgur = getOfficialImgurHeadshotForPlayer(p.name || defaultP?.name, p.jerseyNumber ?? defaultP?.jerseyNumber);
            const cached = getLocalCachedPlayerPhoto(p.id);
            const photoUrl =
              officialImgur ||
              (!isLegacyOrPlaceholderHeadshot(p.photoUrl) ? p.photoUrl : '') ||
              (!isLegacyOrPlaceholderHeadshot(cached) ? cached : '') ||
              defaultP?.photoUrl ||
              '';
            const validDoc = getValidDocumentUrl(p) || (defaultP ? getValidDocumentUrl(defaultP) : undefined);
            return {
              ...defaultP,
              ...p,
              specificPosition: p.specificPosition || defaultP?.specificPosition || p.primaryPosition,
              profilePdfUrl: validDoc || p.profilePdfUrl || defaultP?.profilePdfUrl || '',
              profileDocUrl: validDoc || p.profileDocUrl || defaultP?.profileDocUrl || '',
              photoUrl,
            };
          });
          const { players: enriched } = enrichPlayersWithVerifiedSheet(hydrated);
          enriched.sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999));
          return enriched;
        }
      }
    } catch {}
    return INITIAL_PLAYERS;
  });

  // Use hardcoded data as the initial fallback state while the live Google Apps Script fetch completes
  const [matches, setMatches] = useState<Match[]>(() => sortMatchesByDate(INITIAL_MATCHES));
  const [standings, setStandings] = useState<StandingTeam[]>(INITIAL_STANDINGS);

  const [coaches, setCoaches] = useState<Coach[]>(() => {
    try {
      const saved = localStorage.getItem('daf_team_coaches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (c: Coach) => c.id !== 'c3' && !(c.name || '').toLowerCase().includes('holocher')
          );
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return INITIAL_COACHES;
  });

  const [teamInfo, setTeamInfo] = useState<TeamInfo>(INITIAL_TEAM_INFO);

  // Media States
  const [actionPhotos, setActionPhotos] = useState<ActionPhoto[]>(DEFAULT_ACTION_PHOTOS);
  const [googlePhotosAlbums, setGooglePhotosAlbums] = useState<GooglePhotosAlbum[]>(DEFAULT_GOOGLE_PHOTOS_ALBUMS);
  const [masterAlbumInfo, setMasterAlbumInfo] = useState<MasterAlbumInfo>(DEFAULT_MASTER_ALBUM_INFO);
  const [featuredInstagramPost, setFeaturedInstagramPost] = useState<InstagramPostData>(() => {
    try {
      const saved = localStorage.getItem('daf_featured_instagram_post');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_INSTAGRAM_POST;
  });

  // UI Modal States
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isScoutPackOpen, setIsScoutPackOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<EditorTab>('players');
  const [initialEditingPlayer, setInitialEditingPlayer] = useState<Player | null>(null);
  const [initialEditingCoach, setInitialEditingCoach] = useState<Coach | null>(null);

  // Consolidated team data hydration on mount (server store + one-time Firestore read, no write-back loops)
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchTeamDataFromServerAndCloud();
        if (!isMounted || !data) return;

        if (data.players) {
          const rawFirestore = (data.players as Player[]).filter(p => {
            const n = (p.name || '').toLowerCase();
            return !n.includes('parker') && !n.includes('sasha') && !n.includes('anava');
          });
          const hydrated = rawFirestore.map(p => {
            const defaultP = INITIAL_PLAYERS.find(
              dp => dp.id === p.id || (dp.name && p.name && dp.name.trim().toLowerCase() === p.name.trim().toLowerCase())
            );
            const officialImgur = getOfficialImgurHeadshotForPlayer(
              p.name || defaultP?.name,
              p.jerseyNumber ?? defaultP?.jerseyNumber
            );
            const cached = getLocalCachedPlayerPhoto(p.id);
            const photoUrl =
              officialImgur ||
              (!isLegacyOrPlaceholderHeadshot(p.photoUrl) ? p.photoUrl : '') ||
              (!isLegacyOrPlaceholderHeadshot(cached) ? cached : '') ||
              defaultP?.photoUrl ||
              '';
            const validDoc = getValidDocumentUrl(p) || (defaultP ? getValidDocumentUrl(defaultP) : undefined);
            return {
              ...defaultP,
              ...p,
              photoUrl,
              profilePdfUrl: validDoc || p.profilePdfUrl || defaultP?.profilePdfUrl || '',
              profileDocUrl: validDoc || p.profileDocUrl || defaultP?.profileDocUrl || '',
              specificPosition: p.specificPosition || defaultP?.specificPosition || p.primaryPosition,
            };
          });
          const { players: enriched } = enrichPlayersWithVerifiedSheet(hydrated);
          enriched.sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999));
          setPlayers(enriched);
          try {
            localStorage.setItem('daf_team_players', JSON.stringify(enriched));
          } catch {}
        }

        if (data.coaches) {
          const rawCoaches = data.coaches as Coach[];
          const cleanedCoaches = rawCoaches.filter(
            c => c.id !== 'c3' && !(c.name || '').toLowerCase().includes('holocher')
          );
          setCoaches(cleanedCoaches);
          try {
            localStorage.setItem('daf_team_coaches', JSON.stringify(cleanedCoaches));
          } catch {}
        }

        if (data.teamInfo) {
          const rawPhotoUrl = (data.teamInfo.teamPhotoUrl || '').trim();
          const isLegacySquadPhoto =
            !rawPhotoUrl ||
            rawPhotoUrl.startsWith('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEU') ||
            rawPhotoUrl.includes('images.unsplash.com');
          const resolvedSquadPhotoUrl = isLegacySquadPhoto
            ? OFFICIAL_SQUAD_PHOTO_URL
            : transformImageUrl(rawPhotoUrl);
          const upgradedTeamInfo: TeamInfo = {
            ...data.teamInfo,
            teamPhotoUrl: resolvedSquadPhotoUrl,
          };
          setTeamInfo(prev => ({
            ...upgradedTeamInfo,
            seasonRecord: prev.seasonRecord || upgradedTeamInfo.seasonRecord,
            recentForm: prev.recentForm || upgradedTeamInfo.recentForm,
            recentFormStat: prev.recentFormStat || upgradedTeamInfo.recentFormStat,
          }));
          try {
            localStorage.setItem('daf_team_info', JSON.stringify(upgradedTeamInfo));
          } catch {}
        }

        if (data.actionPhotos) setActionPhotos(data.actionPhotos);
        if (data.googlePhotosAlbums) setGooglePhotosAlbums(data.googlePhotosAlbums);
        if (data.masterAlbumInfo) setMasterAlbumInfo(data.masterAlbumInfo);
        if (data.featuredInstagramPost) {
          setFeaturedInstagramPost(data.featuredInstagramPost);
          try {
            localStorage.setItem('daf_featured_instagram_post', JSON.stringify(data.featuredInstagramPost));
          } catch {}
        }
      } catch (err) {
        console.warn('Team data load notice:', err);
      }
    })();

    // Real-time custom player photos subscriber (Single document read)
    let unsubPhotos = () => {};
    try {
      unsubPhotos = subscribeToPlayerPhotos((photosMap) => {
        setPlayers((currentPlayers) => {
          let changed = false;
          const merged = currentPlayers.map((p) => {
            const customPhoto = photosMap[p.id];
            if (
              customPhoto &&
              !isLegacyOrPlaceholderHeadshot(customPhoto) &&
              customPhoto !== p.photoUrl &&
              !getOfficialImgurHeadshotForPlayer(p.name, p.jerseyNumber)
            ) {
              changed = true;
              return { ...p, photoUrl: customPhoto };
            }
            return p;
          });
          return changed ? merged : currentPlayers;
        });
      });
    } catch (err) {
      console.warn("Failed to subscribe to player photos:", err);
    }

    return () => {
      isMounted = false;
      unsubPhotos();
    };
  }, []);

  // Periodic Roster Google Sheet polling (checks on load and every 15 minutes when rosterGoogleSheetUrl is configured)
  useEffect(() => {
    const sheetUrl = (teamInfo?.rosterGoogleSheetUrl || '').trim();
    if (!sheetUrl) return;
    let active = true;

    const pollRosterSheet = async () => {
      try {
        const { players: synced, changed } = await fetchLiveRosterSheetAndEnrich(sheetUrl, players);
        if (!active || !changed) return;
        synced.sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999));
        setPlayers(synced);
        try {
          localStorage.setItem('daf_team_players', JSON.stringify(synced));
        } catch {}
        const cleanPayload = sanitizeGlobalDocPayload({ players: synced });
        saveTeamDataToServerAndCloud(cleanPayload);
      } catch {}
    };

    pollRosterSheet();
    const intervalId = setInterval(pollRosterSheet, 15 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [teamInfo?.rosterGoogleSheetUrl]);

  // Fetch live ECNL Northern California U16 standings & schedule from Google Apps Script Web App API once on page load
  useEffect(() => {
    let isMounted = true;

    const loadLiveEcnlData = async () => {
      try {
        const payload = await fetchLiveEcnlDataFromApi(ECNL_DATA_API_URL);
        if (!isMounted || !payload) return;

        const hasLiveStandings = Array.isArray(payload.standings) && payload.standings.length > 0;
        const hasLiveSchedule = Array.isArray(payload.schedule) && payload.schedule.length > 0;
        if (!hasLiveStandings && !hasLiveSchedule) return;

        const liveStandings = hasLiveStandings
          ? mapEcnlApiStandings(payload.standings, INITIAL_STANDINGS)
          : INITIAL_STANDINGS;

        const liveMatches = hasLiveSchedule
          ? mapEcnlApiSchedule(payload.schedule, INITIAL_MATCHES)
          : INITIAL_MATCHES;

        if (hasLiveStandings) {
          setStandings(liveStandings);
          try {
            localStorage.setItem('daf_standings', JSON.stringify(liveStandings));
          } catch {}
        }

        if (hasLiveSchedule) {
          const sortedLiveMatches = mergeShowcaseMatchesIntoSchedule(liveMatches, INITIAL_MATCHES);
          setMatches(sortedLiveMatches);
          try {
            localStorage.setItem('daf_team_matches', JSON.stringify(sortedLiveMatches));
          } catch {}
        }

        setTeamInfo((prevInfo) => {
          const updatedInfo = buildTeamInfoFromLiveEcnl(
            prevInfo,
            liveStandings,
            liveMatches,
            payload.updatedAt
          );
          try {
            localStorage.setItem('daf_team_info', JSON.stringify(updatedInfo));
          } catch {}
          return updatedInfo;
        });
      } catch (err) {
        console.warn('Live ECNL Apps Script fetch notice (using initial fallback data):', err);
      }
    };

    loadLiveEcnlData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Admin Mode & Dedicated /admin Route Support
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const cleanPath = window.location.pathname.replace(/\/+$/, '').toLowerCase();
    const params = new URLSearchParams(window.location.search);
    return cleanPath === '/admin' || params.get('view') === 'admin' || params.get('admin') === 'true';
  };

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('daf_team_editor_auth') === 'authenticated';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAdminMode(true);
    }

    const handlePopState = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect permanent QR code redirect parameter (?profile=22 or /profile/22)
  const getProfileRedirectParam = (): string | null => {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams(window.location.search);
    const fromQuery = searchParams.get('profile');
    if (fromQuery && fromQuery.trim() !== '') return fromQuery.trim();

    const pathMatch = window.location.pathname.match(/^\/profile\/([^/?#]+)/i);
    if (pathMatch && pathMatch[1]) {
      try {
        return decodeURIComponent(pathMatch[1]).trim();
      } catch {
        return pathMatch[1].trim();
      }
    }

    if (window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.slice(window.location.hash.indexOf('?'));
      const hashParams = new URLSearchParams(hashQuery);
      const fromHash = hashParams.get('profile');
      if (fromHash && fromHash.trim() !== '') return fromHash.trim();
    }
    return null;
  };

  const findPlayerByRedirectKey = (list: Player[], rawKey: string): Player | undefined => {
    const key = rawKey.trim().replace(/^#/, '').toLowerCase();
    return list.find(
      p =>
        String(p.jerseyNumber).toLowerCase() === key ||
        (p.id || '').toLowerCase() === key ||
        (p.name || '').trim().toLowerCase() === key
    );
  };

  const [profileRedirectKey, setProfileRedirectKey] = useState<string | null>(getProfileRedirectParam);
  const [redirectTargetDocUrl, setRedirectTargetDocUrl] = useState<string | null>(() => {
    const key = getProfileRedirectParam();
    if (!key) return null;
    const initialMatch = findPlayerByRedirectKey(players, key);
    return initialMatch ? getValidDocumentUrl(initialMatch) || null : null;
  });
  const [redirectMatchedPlayer, setRedirectMatchedPlayer] = useState<Player | null>(() => {
    const key = getProfileRedirectParam();
    if (!key) return null;
    return findPlayerByRedirectKey(players, key) || null;
  });

  useEffect(() => {
    if (!profileRedirectKey) return;
    let cancelled = false;

    (async () => {
      let latestList = players;

      // Attempt fast live lookup (max 900ms) so newly updated Google Drive links take effect immediately
      try {
        const liveData = await Promise.race([
          fetchTeamDataFromServerAndCloud(),
          new Promise<null>(resolve => setTimeout(() => resolve(null), 900)),
        ]);
        if (liveData && Array.isArray(liveData.players) && liveData.players.length > 0) {
          const { players: enrichedLive } = enrichPlayersWithVerifiedSheet(liveData.players as Player[]);
          latestList = enrichedLive;
        }
      } catch {}

      if (cancelled) return;

      const matched = findPlayerByRedirectKey(latestList, profileRedirectKey) || findPlayerByRedirectKey(INITIAL_PLAYERS, profileRedirectKey);
      if (!matched) {
        setProfileRedirectKey(null);
        return;
      }

      setRedirectMatchedPlayer(matched);
      const docUrl = getValidDocumentUrl(matched);
      if (docUrl) {
        setRedirectTargetDocUrl(docUrl);
        window.location.replace(docUrl);
      } else {
        // Fallback: if player has not uploaded a PDF yet, open their interactive Player Modal on the site
        setSelectedPlayer(matched);
        setProfileRedirectKey(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileRedirectKey]);

  // Deep-link to player profile modal from QR codes or shared URLs (?player=p1 or /#roster?player=p1)
  useEffect(() => {
    if (profileRedirectKey) return;
    const searchParams = new URLSearchParams(window.location.search);
    let playerId = searchParams.get('player');
    if (!playerId && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.slice(window.location.hash.indexOf('?'));
      const hashParams = new URLSearchParams(hashQuery);
      playerId = hashParams.get('player');
    }
    if (playerId && players.length > 0) {
      const match = findPlayerByRedirectKey(players, playerId);
      if (match) {
        setSelectedPlayer(match);
      }
    }
  }, [players, profileRedirectKey]);

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

  // Save Players & Sync to Firestore (single unified document write, no loop)
  const handleSavePlayers = (updated: Player[]) => {
    setPlayers(updated);
    if (selectedPlayer) {
      const refreshedSelected = updated.find(p => p.id === selectedPlayer.id);
      if (refreshedSelected) {
        setSelectedPlayer(refreshedSelected);
      }
    }

    try {
      localStorage.setItem('daf_team_players', JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage save notice:", e);
    }

    // Save sanitized global payload to server store and Firestore
    const cleanPayload = sanitizeGlobalDocPayload({ players: updated });
    saveTeamDataToServerAndCloud(cleanPayload);
  };

  const handleUpdatePlayerPhoto = (playerId: string, newPhotoUrl: string) => {
    const updated = players.map((p) => (p.id === playerId ? { ...p, photoUrl: newPhotoUrl } : p));
    setPlayers(updated);
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer({ ...selectedPlayer, photoUrl: newPhotoUrl });
    }
    // Only write the single modified photo
    savePlayerPhotoToFirestore(playerId, newPhotoUrl);
    handleSavePlayers(updated);
  };

  const handleDeletePlayer = (playerId: string) => {
    const updated = players.filter((p) => p.id !== playerId);
    savePlayerPhotoToFirestore(playerId, '');
    handleSavePlayers(updated);
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(null);
    }
  };

  // Atomic Match Schedule Save (Consolidates matches + standings into 1 write)
  const handleSaveMatches = (updated: Match[]) => {
    const sorted = sortMatchesByDate(updated);
    setMatches(sorted);
    try {
      localStorage.setItem('daf_team_matches', JSON.stringify(sorted));
    } catch {}
    
    // Automatically recalculate and sync De Anza Force standings and team season record
    const computed = computeRecordAndFormFromMatches(sorted);
    if (computed.completedMatchesCount > 0) {
      const synced = syncStandingsAndTeamInfoWithMatches(sorted, standings, teamInfo);
      setStandings(synced.updatedStandings);
      setTeamInfo(synced.updatedTeamInfo);
      try {
        localStorage.setItem('daf_standings', JSON.stringify(synced.updatedStandings));
        localStorage.setItem('daf_team_info', JSON.stringify(synced.updatedTeamInfo));
      } catch {}
      saveTeamDataToServerAndCloud({
        matches: sorted,
        standings: synced.updatedStandings,
        teamInfo: synced.updatedTeamInfo,
      });
    } else {
      saveTeamDataToServerAndCloud({ matches: sorted });
    }
  };

  const handleSaveStandings = (updated: StandingTeam[]) => {
    setStandings(updated);
    try {
      localStorage.setItem('daf_standings', JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage standings save notice:", e);
    }
    saveTeamDataToServerAndCloud({ standings: updated });
  };

  const handleSaveCoaches = (updated: Coach[]) => {
    setCoaches(updated);
    try {
      localStorage.setItem('daf_team_coaches', JSON.stringify(updated));
    } catch {}
    saveTeamDataToServerAndCloud({ coaches: updated });
  };

  const handleSaveTeamInfo = (updated: TeamInfo) => {
    const normalized: TeamInfo = {
      ...updated,
      teamPhotoUrl: updated.teamPhotoUrl ? transformImageUrl(updated.teamPhotoUrl) : updated.teamPhotoUrl,
    };
    setTeamInfo(normalized);
    try {
      localStorage.setItem('daf_team_info', JSON.stringify(normalized));
    } catch {}
    saveTeamDataToServerAndCloud({ teamInfo: normalized });
  };

  const handleSaveActionPhotos = (updated: ActionPhoto[]) => {
    setActionPhotos(updated);
    try {
      localStorage.setItem('daf_action_photos', JSON.stringify(updated));
    } catch {}
    saveTeamDataToServerAndCloud({ actionPhotos: updated });
  };

  const handleSaveGooglePhotosAlbums = (updated: GooglePhotosAlbum[]) => {
    setGooglePhotosAlbums(updated);
    try {
      localStorage.setItem('daf_google_photos_albums', JSON.stringify(updated));
    } catch {}
    saveTeamDataToServerAndCloud({ googlePhotosAlbums: updated });
  };

  const handleSaveMasterAlbumInfo = (updated: MasterAlbumInfo) => {
    setMasterAlbumInfo(updated);
    try {
      localStorage.setItem('daf_master_album_info', JSON.stringify(updated));
    } catch {}
    saveTeamDataToServerAndCloud({ masterAlbumInfo: updated });
  };

  const handleSaveInstagramPost = (updated: InstagramPostData) => {
    setFeaturedInstagramPost(updated);
    try {
      localStorage.setItem('daf_featured_instagram_post', JSON.stringify(updated));
    } catch {}
    saveTeamDataToServerAndCloud({ featuredInstagramPost: updated });
  };

  const handleSaveAllData = (data: {
    players: Player[];
    matches: Match[];
    standings: StandingTeam[];
    coaches: Coach[];
    teamInfo: TeamInfo;
    actionPhotos: ActionPhoto[];
    googlePhotosAlbums: GooglePhotosAlbum[];
    masterAlbumInfo: MasterAlbumInfo;
  }) => {
    data.matches = sortMatchesByDate(data.matches);
    // Only recalculate De Anza Force from matches if there are actual completed matches recorded
    const computed = computeRecordAndFormFromMatches(data.matches);
    if (computed.completedMatchesCount > 0) {
      const synced = syncStandingsAndTeamInfoWithMatches(data.matches, data.standings, data.teamInfo);
      data.standings = synced.updatedStandings;
      data.teamInfo = synced.updatedTeamInfo;
    }

    try {
      localStorage.setItem('daf_team_players', JSON.stringify(data.players));
      localStorage.setItem('daf_standings', JSON.stringify(data.standings));
      localStorage.setItem('daf_team_matches', JSON.stringify(data.matches));
      localStorage.setItem('daf_team_info', JSON.stringify(data.teamInfo));
      localStorage.setItem('daf_team_coaches', JSON.stringify(data.coaches));
      localStorage.setItem('daf_action_photos', JSON.stringify(data.actionPhotos));
      localStorage.setItem('daf_google_photos_albums', JSON.stringify(data.googlePhotosAlbums));
      localStorage.setItem('daf_master_album_info', JSON.stringify(data.masterAlbumInfo));
    } catch (e) {
      console.warn("LocalStorage save warning:", e);
    }

    setPlayers(data.players);
    setMatches(data.matches);
    setStandings(data.standings);
    setCoaches(data.coaches);
    setTeamInfo(data.teamInfo);
    setActionPhotos(data.actionPhotos);
    setGooglePhotosAlbums(data.googlePhotosAlbums);
    setMasterAlbumInfo(data.masterAlbumInfo);

    // Single atomic save for all modules
    const cleanPayload = sanitizeGlobalDocPayload(data);
    saveTeamDataToServerAndCloud(cleanPayload);
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
    setFeaturedInstagramPost(DEFAULT_INSTAGRAM_POST);
    
    saveTeamDataToServerAndCloud({
      players: INITIAL_PLAYERS,
      matches: INITIAL_MATCHES,
      standings: INITIAL_STANDINGS,
      coaches: INITIAL_COACHES,
      teamInfo: INITIAL_TEAM_INFO,
      actionPhotos: DEFAULT_ACTION_PHOTOS,
      googlePhotosAlbums: DEFAULT_GOOGLE_PHOTOS_ALBUMS,
      masterAlbumInfo: DEFAULT_MASTER_ALBUM_INFO,
      featuredInstagramPost: DEFAULT_INSTAGRAM_POST
    });
  };

  // Find next upcoming match for Next Fixture Spotlight
  const nextMatch = selectNextFixtureMatch(matches);

  // Toggle whether a player is included on the College Scouting Profile Pack
  const handleTogglePlayerScouting = (playerId: string, include: boolean) => {
    const updated = players.map(p => p.id === playerId ? { ...p, includeInScoutingPack: include } : p);
    setPlayers(updated);
    try {
      localStorage.setItem('daf_team_players', JSON.stringify(updated));
    } catch {}
    saveTeamDataToServerAndCloud({ players: updated });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminRoute) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <AdminLoginModal
            isOpen={true}
            onClose={() => {
              setIsAdminRoute(false);
              window.history.pushState({}, '', '/');
            }}
            onSuccess={() => {
              setIsAuthenticated(true);
            }}
          />
        </div>
      );
    }

    return (
      <AdminDashboard
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
        onExitAdmin={() => {
          setIsAdminRoute(false);
          window.history.pushState({}, '', '/');
        }}
        onLogout={() => {
          sessionStorage.removeItem('daf_team_editor_auth');
          setIsAuthenticated(false);
          setIsAdminRoute(false);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (profileRedirectKey) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md rounded-2xl bg-[#0e1526] border border-slate-800 p-8 shadow-2xl space-y-5">
          <div className="flex justify-center">
            <ClubCrest className="w-16 h-16" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              De Anza Force U16G ECNL
            </p>
            <h1 className="font-condensed font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
              {redirectMatchedPlayer
                ? `#${redirectMatchedPlayer.jerseyNumber} ${redirectMatchedPlayer.name}`
                : 'Player Profile Redirect'}
            </h1>
            <p className="text-xs text-slate-400">
              Forwarding to the latest player profile document...
            </p>
          </div>

          {redirectTargetDocUrl && (
            <div className="pt-2 space-y-3">
              <a
                href={redirectTargetDocUrl}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg transition-colors whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Open Player Profile Document</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  if (redirectMatchedPlayer) {
                    setSelectedPlayer(redirectMatchedPlayer);
                  }
                  setProfileRedirectKey(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors whitespace-nowrap"
              >
                View Interactive Roster Profile Instead
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
          isAdminMode={isAdminMode}
          featuredInstagramPost={featuredInstagramPost}
          onSaveFeaturedInstagramPost={handleSaveInstagramPost}
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

              {/* Team Website QR Code */}
              <div className="pt-3">
                <a
                  href="https://www.deanzaforce2011g.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00ADEF] transition-all group"
                  title="Scan or click for Team Website"
                >
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https%3A%2F%2Fwww.deanzaforce2011g.com%2F"
                    alt="Team Website QR Code"
                    className="w-12 h-12 border border-slate-200 dark:border-slate-700 rounded bg-white p-0.5"
                    loading="lazy"
                  />
                  <div>
                    <span className="font-condensed font-black text-xs tracking-wider text-slate-950 dark:text-white block group-hover:text-[#00ADEF] transition-colors font-mono">
                      https://www.deanzaforce2011g.com/
                    </span>
                  </div>
                </a>
              </div>

              {/* Secure Single Team Editor Access Button */}
              {isAdminMode && (
                <div className="pt-4 flex items-center gap-2">
                  <button
                    id="footer-team-editor-btn"
                    onClick={() => {
                      setIsAdminRoute(true);
                      window.history.pushState({}, '', '/admin');
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-[#00ADEF] text-xs font-bold transition-all shadow-sm group cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#00ADEF] group-hover:scale-110 transition-transform" />
                    <span>Admin Portal</span>
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
            onEditPlayer={isAuthenticated ? (player) => handleOpenTeamEditor('players', player) : undefined}
            onDeletePlayer={isAuthenticated ? handleDeletePlayer : undefined}
            onUpdatePlayerPhoto={isAuthenticated ? handleUpdatePlayerPhoto : undefined}
            onTogglePlayerScouting={isAuthenticated ? handleTogglePlayerScouting : undefined}
            isAdminMode={isAuthenticated}
          />
        )}
      </AnimatePresence>

      {/* Staff Authentication Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAuthenticated(true);
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
        onSaveAllData={handleSaveAllData}
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
        onTogglePlayerScouting={handleTogglePlayerScouting}
      />

    </div>
  );
}
