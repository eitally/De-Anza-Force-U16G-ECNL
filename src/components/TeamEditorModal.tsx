import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import type { 
  Player, 
  Match, 
  StandingTeam, 
  Coach, 
  TeamInfo, 
  PositionCategory,
  ActionPhoto, 
  GooglePhotosAlbum, 
  MasterAlbumInfo
} from '../types';
import { getSafeImageSrc, handleImageError, DEFAULT_PLAYER_PHOTO, DEFAULT_COACH_PHOTO } from '../utils/imageUtils';
import { 
  INITIAL_STANDINGS, 
  DEFAULT_ACTION_PHOTOS, 
  DEFAULT_GOOGLE_PHOTOS_ALBUMS, 
  DEFAULT_MASTER_ALBUM_INFO 
} from '../data/defaultData';
import { TeamPhotoManager } from './TeamPhotoManager';
import { computeRecordAndFormFromMatches, syncStandingsAndTeamInfoWithMatches } from '../utils/recordUtils';
import { 
  X, 
  Users, 
  Calendar, 
  Trophy, 
  ShieldCheck, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  Upload, 
  Download, 
  Check, 
  Sparkles, 
  FileText, 
  Copy, 
  AlertCircle,
  HelpCircle,
  Mail,
  Phone,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Camera,
  Image as ImageIcon,
  Instagram,
  ExternalLink,
  FolderOpen,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ListOrdered,
  Calculator,
  Link2,
  CheckCircle2,
  Sliders,
  MapPin,
  Clock,
  Video,
  Zap
} from 'lucide-react';

export type EditorTab = 'players' | 'coaches' | 'schedule' | 'standings' | 'team' | 'media' | 'import_export';

interface TeamEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamInfo: TeamInfo;
  players: Player[];
  matches: Match[];
  standings: StandingTeam[];
  coaches: Coach[];
  actionPhotos?: ActionPhoto[];
  googlePhotosAlbums?: GooglePhotosAlbum[];
  masterAlbumInfo?: MasterAlbumInfo;
  onSavePlayers: (players: Player[]) => void;
  onSaveMatches: (matches: Match[]) => void;
  onSaveStandings: (standings: StandingTeam[]) => void;
  onSaveCoaches: (coaches: Coach[]) => void;
  onSaveTeamInfo: (info: TeamInfo) => void;
  onSaveActionPhotos?: (photos: ActionPhoto[]) => void;
  onSaveGooglePhotosAlbums?: (albums: GooglePhotosAlbum[]) => void;
  onSaveMasterAlbumInfo?: (info: MasterAlbumInfo) => void;
  onResetToDefaults: () => void;
  initialEditingPlayer?: Player | null;
  initialEditingCoach?: Coach | null;
  initialTab?: EditorTab;
}

export const TeamEditorModal: React.FC<TeamEditorModalProps> = ({
  isOpen,
  onClose,
  teamInfo,
  players,
  matches,
  standings,
  coaches,
  actionPhotos,
  googlePhotosAlbums,
  masterAlbumInfo,
  onSavePlayers,
  onSaveMatches,
  onSaveStandings,
  onSaveCoaches,
  onSaveTeamInfo,
  onSaveActionPhotos,
  onSaveGooglePhotosAlbums,
  onSaveMasterAlbumInfo,
  onResetToDefaults,
  initialEditingPlayer,
  initialEditingCoach,
  initialTab = 'players',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Local states for editing
  const [localPlayers, setLocalPlayers] = useState<Player[]>(players);
  const [localMatches, setLocalMatches] = useState<Match[]>(matches);
  const [localStandings, setLocalStandings] = useState<StandingTeam[]>(standings);
  const [localCoaches, setLocalCoaches] = useState<Coach[]>(coaches);
  const [localTeamInfo, setLocalTeamInfo] = useState<TeamInfo>(teamInfo);

  // Photos & Albums state for Media Tab
  const [localPhotos, setLocalPhotos] = useState<ActionPhoto[]>(() => {
    if (actionPhotos) return actionPhotos;
    const saved = localStorage.getItem('daf_action_photos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ACTION_PHOTOS;
  });

  const [localAlbums, setLocalAlbums] = useState<GooglePhotosAlbum[]>(() => {
    if (googlePhotosAlbums) return googlePhotosAlbums;
    const saved = localStorage.getItem('daf_google_photos_albums');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_GOOGLE_PHOTOS_ALBUMS;
  });

  const [localMasterAlbum, setLocalMasterAlbum] = useState<MasterAlbumInfo>(() => {
    if (masterAlbumInfo && masterAlbumInfo.url) return masterAlbumInfo;
    const saved = localStorage.getItem('daf_master_album_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.url) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MASTER_ALBUM_INFO;
  });

  // Permanent Master Album form inputs
  const [masterUrl, setMasterUrl] = useState(localMasterAlbum.url || 'https://linktr.ee/willow_glen_photography');
  const [masterTitle, setMasterTitle] = useState(localMasterAlbum.title || 'Willow Glen Photography • Team Photo Hub');
  const [masterSubtitle, setMasterSubtitle] = useState(localMasterAlbum.subtitle || 'Official team matchday albums, high-resolution tournament archives, and downloadable player galleries.');
  const [masterBadge, setMasterBadge] = useState(localMasterAlbum.badge || 'Master Album List');
  const [masterPhotographer, setMasterPhotographer] = useState(localMasterAlbum.photographerName || 'Willow Glen Photography');

  // Media sub-modal / form states for Action Photos
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoSubtitle, setNewPhotoSubtitle] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState('');
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<ActionPhoto | null>(null);

  // Media sub-modal / form states for Google Photos Match Albums
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumUrl, setNewAlbumUrl] = useState('');
  const [newAlbumSubtitle, setNewAlbumSubtitle] = useState('');
  const [newAlbumCover, setNewAlbumCover] = useState('');
  const [newAlbumBadge, setNewAlbumBadge] = useState('Matchday');
  const [newAlbumPhotoCount, setNewAlbumPhotoCount] = useState('');
  const [newAlbumDate, setNewAlbumDate] = useState('');
  const [isAddingAlbum, setIsAddingAlbum] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GooglePhotosAlbum | null>(null);

  // Player being actively edited in sub-form
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(initialEditingPlayer || null);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  // Coach being actively edited in sub-form
  const [editingCoach, setEditingCoach] = useState<Coach | null>(initialEditingCoach || null);
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);

  // In-app Confirmation Dialog States
  const [playerPendingDelete, setPlayerPendingDelete] = useState<Player | null>(null);
  const [coachPendingDelete, setCoachPendingDelete] = useState<Coach | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Raw text importer state
  const [rawRosterInput, setRawRosterInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Roster Editor Sorting & Search State
  type RosterEditorSortField = 'jerseyNumber' | 'name' | 'position' | 'ageGroup' | 'gradYear' | 'gpa' | 'commitment';
  const [rosterSortField, setRosterSortField] = useState<RosterEditorSortField>('jerseyNumber');
  const [rosterSortDir, setRosterSortDir] = useState<'asc' | 'desc'>('asc');
  const [rosterFilterSearch, setRosterFilterSearch] = useState('');

  const handleRosterSortToggle = (field: RosterEditorSortField) => {
    if (rosterSortField === field) {
      setRosterSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setRosterSortField(field);
      setRosterSortDir(field === 'gpa' ? 'desc' : 'asc');
    }
  };

  const sortedAndFilteredLocalPlayers = useMemo(() => {
    const filtered = localPlayers.filter((player) => {
      if (!rosterFilterSearch.trim()) return true;
      const q = rosterFilterSearch.toLowerCase();
      const matchesName = (player.name || '').toLowerCase().includes(q);
      const matchesJersey = (player.jerseyNumber ?? '').toString().includes(q);
      const matchesPosition = (player.specificPosition || '').toLowerCase().includes(q) || (player.primaryPosition || '').toLowerCase().includes(q);
      const matchesSchool = (player.highSchool || '').toLowerCase().includes(q);
      const matchesCommitment = (player.commitment || '').toLowerCase().includes(q);
      return matchesName || matchesJersey || matchesPosition || matchesSchool || matchesCommitment;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (rosterSortField) {
        case 'jerseyNumber':
          comparison = (a.jerseyNumber || 0) - (b.jerseyNumber || 0);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'position':
          comparison = (a.specificPosition || a.primaryPosition || '').localeCompare(b.specificPosition || b.primaryPosition || '');
          break;
        case 'ageGroup':
          comparison = (a.ageGroup || 'U16').localeCompare(b.ageGroup || 'U16');
          break;
        case 'gradYear':
          comparison = (a.gradYear || 0) - (b.gradYear || 0);
          break;
        case 'gpa':
          comparison = (parseFloat(a.gpa) || 0) - (parseFloat(b.gpa) || 0);
          break;
        case 'commitment':
          comparison = (a.commitment || '').localeCompare(b.commitment || '');
          break;
        default:
          comparison = (a.jerseyNumber || 0) - (b.jerseyNumber || 0);
      }
      return rosterSortDir === 'asc' ? comparison : -comparison;
    });
  }, [localPlayers, rosterSortField, rosterSortDir, rosterFilterSearch]);

  // Sync props and storage when opening
  useEffect(() => {
    if (isOpen) {
      setLocalPlayers(players);
      setLocalMatches(matches);
      setLocalStandings(standings);
      setLocalCoaches(coaches);
      setLocalTeamInfo(teamInfo);

      // Sync photos
      if (actionPhotos) {
        setLocalPhotos(actionPhotos);
      } else {
        const savedPhotos = localStorage.getItem('daf_action_photos');
        if (savedPhotos) {
          try {
            const parsed = JSON.parse(savedPhotos);
            if (Array.isArray(parsed)) setLocalPhotos(parsed);
          } catch (e) {
            console.error(e);
          }
        }
      }

      // Sync albums
      if (googlePhotosAlbums) {
        setLocalAlbums(googlePhotosAlbums);
      } else {
        const savedAlbums = localStorage.getItem('daf_google_photos_albums');
        if (savedAlbums) {
          try {
            const parsed = JSON.parse(savedAlbums);
            if (Array.isArray(parsed)) setLocalAlbums(parsed);
          } catch (e) {
            console.error(e);
          }
        }
      }

      // Sync Master Album info
      let activeMaster = DEFAULT_MASTER_ALBUM_INFO;
      if (masterAlbumInfo && masterAlbumInfo.url) {
        activeMaster = masterAlbumInfo;
      } else {
        const savedMaster = localStorage.getItem('daf_master_album_info');
        if (savedMaster) {
          try {
            const parsed = JSON.parse(savedMaster);
            if (parsed && parsed.url) activeMaster = parsed;
          } catch (e) {
            console.error(e);
          }
        }
      }
      setLocalMasterAlbum(activeMaster);
      setMasterUrl(activeMaster.url || 'https://linktr.ee/willow_glen_photography');
      setMasterTitle(activeMaster.title || 'Willow Glen Photography • Team Photo Hub');
      setMasterSubtitle(activeMaster.subtitle || 'Official team matchday albums, high-resolution tournament archives, and downloadable player galleries.');
      setMasterBadge(activeMaster.badge || 'Master Album List');
      setMasterPhotographer(activeMaster.photographerName || 'Willow Glen Photography');

      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (initialEditingPlayer) {
        setEditingPlayer(initialEditingPlayer);
        setIsCreatingPlayer(false);
      }
      if (initialEditingCoach) {
        setEditingCoach(initialEditingCoach);
        setIsCreatingCoach(false);
      }
    }
  }, [isOpen, initialTab, initialEditingPlayer, initialEditingCoach, players, matches, standings, coaches, teamInfo, actionPhotos, googlePhotosAlbums, masterAlbumInfo]);

  const showNotification = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Live computed match records and form for quick admin insights
  const computedMatchRecord = useMemo(() => {
    return computeRecordAndFormFromMatches(localMatches);
  }, [localMatches]);

  const handleAutoSyncRecordAndForm = () => {
    const synced = syncStandingsAndTeamInfoWithMatches(localMatches, localStandings, localTeamInfo);
    setLocalStandings(synced.updatedStandings);
    setLocalTeamInfo(synced.updatedTeamInfo);
    onSaveStandings(synced.updatedStandings);
    onSaveTeamInfo(synced.updatedTeamInfo);
    showNotification(`⚡ Auto-synced season record (${synced.computed.wins}W-${synced.computed.losses}L-${synced.computed.draws}D) and past 5 match form [${synced.computed.form.filter(f => f !== '-').join(', ')}]!`);
  };

  // Media Handlers (Photos, Albums, and Master Album Link)
  const saveMedia = (
    photosList: ActionPhoto[], 
    albumsList: GooglePhotosAlbum[], 
    masterInfo: MasterAlbumInfo = localMasterAlbum
  ) => {
    setLocalPhotos(photosList);
    setLocalAlbums(albumsList);
    setLocalMasterAlbum(masterInfo);

    try {
      localStorage.setItem('daf_action_photos', JSON.stringify(photosList));
      localStorage.setItem('daf_google_photos_albums', JSON.stringify(albumsList));
      localStorage.setItem('daf_master_album_info', JSON.stringify(masterInfo));
      
      // Also update teamInfo socialLinks if photosHub is used
      setLocalTeamInfo(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          photosHub: masterInfo.url
        }
      }));

      window.dispatchEvent(new CustomEvent('daf_media_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }

    if (onSaveActionPhotos) onSaveActionPhotos(photosList);
    if (onSaveGooglePhotosAlbums) onSaveGooglePhotosAlbums(albumsList);
    if (onSaveMasterAlbumInfo) onSaveMasterAlbumInfo(masterInfo);
  };

  // Master Album Link Handler
  const handleSaveMasterLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedMaster: MasterAlbumInfo = {
      url: masterUrl.trim() || 'https://linktr.ee/willow_glen_photography',
      title: masterTitle.trim() || 'Willow Glen Photography • Team Photo Hub',
      subtitle: masterSubtitle.trim() || 'Official team matchday albums, high-resolution tournament archives, and downloadable player galleries.',
      badge: masterBadge.trim() || 'Master Album List',
      photographerName: masterPhotographer.trim() || 'Willow Glen Photography',
    };
    saveMedia(localPhotos, localAlbums, updatedMaster);
    showNotification('✓ Saved permanent master album list link!');
  };

  // Action Photos Handlers
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const newPhotoItem: ActionPhoto = {
      id: `photo_${Date.now()}`,
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim() || 'Match Action Highlight',
      subtitle: newPhotoSubtitle.trim() || 'De Anza Force U16 ECNL Matchday Play',
      tag: newPhotoTag.trim() || 'Matchday Action',
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    const updated = [newPhotoItem, ...localPhotos];
    saveMedia(updated, localAlbums, localMasterAlbum);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoSubtitle('');
    setNewPhotoTag('');
    setIsAddingPhoto(false);
    showNotification('✓ Added new action photo to carousel!');
  };

  const handleSaveEditedPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const updated = localPhotos.map(p => p.id === editingPhoto.id ? editingPhoto : p);
    saveMedia(updated, localAlbums, localMasterAlbum);
    setEditingPhoto(null);
    showNotification('✓ Updated action photo details!');
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localPhotos.length) return;
    const updated = [...localPhotos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    saveMedia(updated, localAlbums, localMasterAlbum);
  };

  const handleDeletePhoto = (photoId: string) => {
    const updated = localPhotos.filter((p) => p.id !== photoId);
    saveMedia(updated, localAlbums, localMasterAlbum);
    if (editingPhoto?.id === photoId) setEditingPhoto(null);
    showNotification('✓ Removed photo from action carousel.');
  };

  // Match Albums Handlers
  const handleAddAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumUrl.trim() || !newAlbumTitle.trim()) return;

    const newAlbumItem: GooglePhotosAlbum = {
      id: `album_${Date.now()}`,
      title: newAlbumTitle.trim(),
      subtitle: newAlbumSubtitle.trim() || 'Official game photos on Google Photos',
      albumUrl: newAlbumUrl.trim(),
      coverImageUrl: newAlbumCover.trim() || localPhotos[0]?.url || DEFAULT_ACTION_PHOTOS[0].url,
      date: newAlbumDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      photoCount: newAlbumPhotoCount.trim() || 'New Album',
      badge: newAlbumBadge.trim() || 'Matchday',
    };

    const updated = [newAlbumItem, ...localAlbums];
    saveMedia(localPhotos, updated, localMasterAlbum);
    setNewAlbumTitle('');
    setNewAlbumUrl('');
    setNewAlbumSubtitle('');
    setNewAlbumCover('');
    setNewAlbumBadge('Matchday');
    setNewAlbumPhotoCount('');
    setNewAlbumDate('');
    setIsAddingAlbum(false);
    showNotification('✓ Added new Google Photos match album link!');
  };

  const handleSaveEditedAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum) return;

    const updated = localAlbums.map(a => a.id === editingAlbum.id ? editingAlbum : a);
    saveMedia(localPhotos, updated, localMasterAlbum);
    setEditingAlbum(null);
    showNotification('✓ Updated match album details!');
  };

  const handleMoveAlbum = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localAlbums.length) return;
    const updated = [...localAlbums];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    saveMedia(localPhotos, updated, localMasterAlbum);
  };

  const handleDeleteAlbum = (albumId: string) => {
    const updated = localAlbums.filter((a) => a.id !== albumId);
    saveMedia(localPhotos, updated, localMasterAlbum);
    if (editingAlbum?.id === albumId) setEditingAlbum(null);
    showNotification('✓ Removed Google Photos match album link.');
  };

  // Save all changes
  const handleSaveAll = () => {
    onSavePlayers(localPlayers);
    onSaveMatches(localMatches);
    onSaveStandings(localStandings);
    onSaveCoaches(localCoaches);
    onSaveTeamInfo(localTeamInfo);
    saveMedia(localPhotos, localAlbums, localMasterAlbum);
    showNotification('✓ All team changes saved successfully!');
  };

  // Save single player edits
  const handleSavePlayerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    if (isCreatingPlayer) {
      const newPlayer = { ...editingPlayer, id: `p_${Date.now()}` };
      const updated = [...localPlayers, newPlayer];
      setLocalPlayers(updated);
      onSavePlayers(updated);
      setIsCreatingPlayer(false);
      showNotification(`✓ Added new player #${editingPlayer.jerseyNumber} ${editingPlayer.name}`);
    } else {
      const updated = localPlayers.map((p) => (p.id === editingPlayer.id ? editingPlayer : p));
      setLocalPlayers(updated);
      onSavePlayers(updated);
      showNotification(`✓ Updated profile for ${editingPlayer.name}`);
    }
    setEditingPlayer(null);
  };

  const handleDeletePlayerClick = (player: Player) => {
    setPlayerPendingDelete(player);
  };

  const executeDeletePlayer = (targetPlayer: Player) => {
    const updated = localPlayers.filter((p) => p.id !== targetPlayer.id);
    setLocalPlayers(updated);
    onSavePlayers(updated); // Persist immediately to localStorage and App state
    if (editingPlayer?.id === targetPlayer.id) {
      setEditingPlayer(null);
    }
    setPlayerPendingDelete(null);
    showNotification(`✓ Removed #${targetPlayer.jerseyNumber} ${targetPlayer.name} from the roster.`);
  };

  // Coach Management Handlers
  const handleCreateNewCoach = () => {
    setIsCreatingCoach(true);
    setEditingCoach({
      id: `c_${Date.now()}`,
      name: '',
      role: 'Assistant Coach',
      license: 'USSF National License',
      experience: '10+ Years Elite Youth Soccer',
      email: '',
      phone: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      bio: '',
      almaMater: '',
    });
  };

  const handleSaveCoachForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;

    if (isCreatingCoach) {
      const newCoach = { ...editingCoach, id: editingCoach.id || `c_${Date.now()}` };
      const updated = [...localCoaches, newCoach];
      setLocalCoaches(updated);
      onSaveCoaches(updated);
      setIsCreatingCoach(false);
      showNotification(`✓ Added ${newCoach.name} to coaching staff`);
    } else {
      const updated = localCoaches.map((c) => (c.id === editingCoach.id ? editingCoach : c));
      setLocalCoaches(updated);
      onSaveCoaches(updated);
      showNotification(`✓ Updated staff profile for ${editingCoach.name}`);
    }
    setEditingCoach(null);
  };

  const handleDeleteCoachClick = (coach: Coach) => {
    setCoachPendingDelete(coach);
  };

  const executeDeleteCoach = (targetCoach: Coach) => {
    const updated = localCoaches.filter((c) => c.id !== targetCoach.id);
    setLocalCoaches(updated);
    onSaveCoaches(updated);
    if (editingCoach?.id === targetCoach.id) {
      setEditingCoach(null);
      setIsCreatingCoach(false);
    }
    setCoachPendingDelete(null);
    showNotification(`✓ Removed ${targetCoach.name} from coaching staff.`);
  };

  // Quick text parser for copy-pasting raw roster info
  const handleParseRawText = () => {
    if (!rawRosterInput.trim()) return;

    const lines = rawRosterInput.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedPlayers: Player[] = [];

    lines.forEach((line, index) => {
      // Try to extract jersey, name, position
      // Examples: "1 Maya Lin GK Mitty", "#7 Kaia Vance FW 4.15", "Sophia Sterling LB 2028"
      const numberMatch = line.match(/(?:#|^)(\d{1,2})\b/);
      const jersey = numberMatch && numberMatch[1] ? parseInt(numberMatch[1], 10) : index + 1;
      
      // Clean out number
      let cleanLine = line.replace(/(?:#|^)\d{1,2}\s*/, '').trim();

      // Guess position
      let pos: PositionCategory = 'Midfielder';
      let specificPos = 'Midfielder';
      if (/GK|Keeper|Goal|Keeper/i.test(cleanLine)) {
        pos = 'Goalkeeper';
        specificPos = 'Goalkeeper (GK)';
      } else if (/FW|Forward|Striker|Winger|ST|RW|LW/i.test(cleanLine)) {
        pos = 'Forward';
        specificPos = 'Forward / Winger';
      } else if (/DEF|Defender|Back|CB|RB|LB|Fullback/i.test(cleanLine)) {
        pos = 'Defender';
        specificPos = 'Defender (Backline)';
      }

      // Extract name (first 2 words)
      const words = cleanLine.split(/\s+/);
      const name = words.slice(0, 2).join(' ') || `Player ${jersey}`;

      parsedPlayers.push({
        id: `parsed_${Date.now()}_${index}`,
        name: name,
        jerseyNumber: jersey,
        primaryPosition: pos,
        specificPosition: specificPos,
        secondaryPositions: [],
        gradYear: 2028,
        birthYear: 2010,
        height: `5'7"`,
        dominantFoot: 'Right',
        highSchool: 'Bay Area High School',
        gpa: '4.0',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        bio: 'Dedicated player with high tactical intelligence and strong work rate.',
        commitment: 'Uncommitted',
        awards: ['ECNL NorCal Candidate'],
        stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, minutesPlayed: 0 },
        hometown: 'Bay Area, CA',
      });
    });

    if (parsedPlayers.length > 0) {
      setLocalPlayers(parsedPlayers);
      setImportStatus(`✓ Successfully extracted and imported ${parsedPlayers.length} players!`);
      showNotification(`✓ Loaded ${parsedPlayers.length} players from text.`);
    } else {
      setImportStatus('⚠️ Could not parse players. Please check the format and try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        handleSaveAll();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0b111e] border border-blue-800/60 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-[#0a1224] to-red-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-slate-900 dark:text-white shadow-md">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-condensed font-black text-xl sm:text-2xl uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                TEAM MANAGEMENT & ROSTER EDITOR
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Easily update your {localPlayers.length}-player roster, match schedules, league table, and team details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-red-600 transition-colors border border-slate-300 dark:border-slate-700"
              aria-label="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {saveSuccessMessage && (
          <div className="bg-emerald-950 border-b border-emerald-700 px-4 py-2 text-xs font-bold text-emerald-300 flex items-center justify-between">
            <span>{saveSuccessMessage}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto p-2 bg-white dark:bg-[#080d18] border-b border-slate-200 dark:border-slate-800 shrink-0">
          {[
            { id: 'players', label: `Players Roster (${localPlayers.length})`, icon: Users },
            { id: 'coaches', label: `Coaching Staff (${localCoaches.length})`, icon: ShieldCheck },
            { id: 'schedule', label: `Match Schedule (${localMatches.length})`, icon: Calendar },
            { id: 'standings', label: 'Standings & Record', icon: Trophy },
            { id: 'team', label: 'Club & Facility Info', icon: Settings },
            { id: 'media', label: `Action Photos & Match Albums (${localPhotos.length} / ${localAlbums.length})`, icon: Camera },
            { id: 'import_export', label: 'Quick Paste & Backup', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as EditorTab);
                  if (tab.id !== 'players') setEditingPlayer(null);
                  if (tab.id !== 'coaches') setEditingCoach(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-condensed font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#080d17]">
          
          {/* TAB 1: PLAYERS ROSTER */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              
              {/* If editing a specific player in form */}
              {editingPlayer ? (
                <form onSubmit={handleSavePlayerForm} className="space-y-4 bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-blue-900/50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                      {isCreatingPlayer ? 'Add New Player to Roster' : `Edit Profile: ${editingPlayer.name} (#${editingPlayer.jerseyNumber})`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingPlayer(null)}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {/* Captain Toggle Checkbox */}
                    <div className="sm:col-span-2 md:col-span-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-amber-500/40 flex items-center justify-between shadow-sm">
                      <label className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-200 font-bold text-xs select-none">
                        <input
                          type="checkbox"
                          checked={!!editingPlayer.isCaptain}
                          onChange={(e) => setEditingPlayer({ ...editingPlayer, isCaptain: e.target.checked })}
                          className="w-4 h-4 rounded text-amber-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <Star className={`w-4 h-4 ${editingPlayer.isCaptain ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                          <span className="text-amber-400 font-condensed font-black text-sm uppercase tracking-wider">
                            Team Captain
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">
                            — Displays official "CAPTAIN" badge on cards, roster tables & scout packs
                          </span>
                        </div>
                      </label>
                      {editingPlayer.isCaptain && (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                          Active Captain
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Full Player Name</label>
                      <input
                        type="text"
                        required
                        value={editingPlayer.name}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Jersey Number</label>
                      <input
                        type="number"
                        required
                        value={editingPlayer.jerseyNumber}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, jerseyNumber: parseInt(e.target.value, 10) || 0 })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Primary Position Category</label>
                      <select
                        value={editingPlayer.primaryPosition}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, primaryPosition: e.target.value as PositionCategory })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      >
                        <option value="Forward">Forward</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Defender">Defender</option>
                        <option value="Goalkeeper">Goalkeeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Specific Position Title (e.g. Center Back (#4))</label>
                      <input
                        type="text"
                        value={editingPlayer.specificPosition}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, specificPosition: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Graduation Year</label>
                      <input
                        type="number"
                        value={editingPlayer.gradYear}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, gradYear: parseInt(e.target.value, 10) || 2028 })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    {/* Exact Birthday Date of Birth */}
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">
                        Date of Birth <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={editingPlayer.birthday || ''}
                        onChange={(e) => {
                          const bday = e.target.value;
                          const bYear = bday ? new Date(bday).getFullYear() : editingPlayer.birthYear;
                          setEditingPlayer({
                            ...editingPlayer,
                            birthday: bday,
                            birthYear: bYear && !isNaN(bYear) ? bYear : editingPlayer.birthYear,
                          });
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Height (e.g. 5'8")</label>
                      <input
                        type="text"
                        value={editingPlayer.height}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, height: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Dominant Foot</label>
                      <select
                        value={editingPlayer.dominantFoot}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, dominantFoot: e.target.value as 'Right' | 'Left' | 'Both' })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      >
                        <option value="Right">Right</option>
                        <option value="Left">Left</option>
                        <option value="Both">Both Feet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">High School</label>
                      <input
                        type="text"
                        value={editingPlayer.highSchool}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, highSchool: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">GPA (e.g. 4.25)</label>
                      <input
                        type="text"
                        value={editingPlayer.gpa}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, gpa: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">College Commitment</label>
                      <div className="flex gap-2">
                        <select
                          value={editingPlayer.commitment === 'Uncommitted' || !editingPlayer.commitment ? 'Uncommitted' : 'Committed'}
                          onChange={(e) => {
                            if (e.target.value === 'Uncommitted') {
                              setEditingPlayer({ ...editingPlayer, commitment: 'Uncommitted' });
                            } else {
                              setEditingPlayer({ ...editingPlayer, commitment: '' });
                            }
                          }}
                          className={`${editingPlayer.commitment === 'Uncommitted' || !editingPlayer.commitment ? 'w-full' : 'w-1/3'} p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500`}
                        >
                          <option value="Uncommitted">Uncommitted</option>
                          <option value="Committed">Committed</option>
                        </select>
                        {editingPlayer.commitment !== 'Uncommitted' && editingPlayer.commitment !== undefined && (
                          <input
                            type="text"
                            placeholder="College Name"
                            value={editingPlayer.commitment}
                            onChange={(e) => setEditingPlayer({ ...editingPlayer, commitment: e.target.value })}
                            className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">NCAA Eligibility ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 250189921"
                        value={editingPlayer.ncaaId || ''}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, ncaaId: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Highlight Video URL (YouTube/Hudl)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={editingPlayer.highlightsUrl || ''}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, highlightsUrl: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Instagram Profile URL</label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/..."
                        value={editingPlayer.instagram || ''}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, instagram: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Player Profile PDF Link (Downloadable Flyer)</label>
                      <input
                        type="url"
                        placeholder="https://... or PDF document URL"
                        value={editingPlayer.profilePdfUrl || editingPlayer.profileDocUrl || ''}
                        onChange={(e) => setEditingPlayer({ 
                          ...editingPlayer, 
                          profilePdfUrl: e.target.value,
                          profileDocUrl: e.target.value 
                        })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Headshot Photo URL & Device Upload Box with Live Image Preview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-blue-900/40 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-200 font-bold text-xs">Player Headshot Photo</label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Upload directly from your phone/computer or paste any image URL (Google Drive, Dropbox, or web link).
                        </p>
                      </div>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-bold cursor-pointer shadow transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const res = event.target?.result as string;
                              if (res) {
                                setEditingPlayer({ ...editingPlayer, photoUrl: res });
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Live Image Preview */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-500/60 shrink-0 shadow relative">
                        <img
                          key={editingPlayer.photoUrl}
                          src={getSafeImageSrc(editingPlayer.photoUrl, DEFAULT_PLAYER_PHOTO)}
                          alt="Preview"
                          className="w-full h-full object-cover object-top"
                          onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Paste image URL (e.g. https://... or Google Drive link)"
                          value={editingPlayer.photoUrl}
                          onChange={(e) => setEditingPlayer({ ...editingPlayer, photoUrl: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                        />
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>✓ Google Drive, Dropbox, and cloud storage links automatically convert to direct image streams.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 text-xs">Player Bio & Tactical Profile</label>
                    <textarea
                      rows={3}
                      value={editingPlayer.bio}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, bio: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                    />
                  </div>

                  {/* Season Stats Row */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-slate-600 dark:text-slate-300 font-bold mb-2 text-xs">2025/2026 Season Stats</label>
                    {editingPlayer.primaryPosition === 'Goalkeeper' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Appearances</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.appearances}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, appearances: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Clean Sheets</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.cleanSheets || 0}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, cleanSheets: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Saves</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.saves || 0}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, saves: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Appearances</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.appearances}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, appearances: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Match Starts</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.starts ?? editingPlayer.stats.appearances}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, starts: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Goals</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.goals}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, goals: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Assists</span>
                          <input
                            type="number"
                            value={editingPlayer.stats.assists}
                            onChange={(e) => setEditingPlayer({
                              ...editingPlayer,
                              stats: { ...editingPlayer.stats, assists: parseInt(e.target.value, 10) || 0 }
                            })}
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    {!isCreatingPlayer && editingPlayer ? (
                      <button
                        type="button"
                        onClick={() => handleDeletePlayerClick(editingPlayer)}
                        className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Player</span>
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlayer(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white text-xs font-bold shadow-md"
                      >
                        Save Player
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  {/* Top Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Full Squad Roster</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 text-xs font-mono font-bold border border-blue-800">
                          {localPlayers.length} Athletes
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Sort columns, search players, or click "Edit" on any athlete to modify their profile and stats.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsCreatingPlayer(true);
                          setEditingPlayer({
                            id: `new_${Date.now()}`,
                            name: '',
                            jerseyNumber: localPlayers.length + 1,
                            primaryPosition: 'Midfielder',
                            specificPosition: 'Midfielder',
                            secondaryPositions: [],
                            gradYear: 2028,
                            birthYear: 2010,
                            height: `5'7"`,
                            dominantFoot: 'Right',
                            highSchool: '',
                            gpa: '4.0',
                            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
                            bio: '',
                            commitment: 'Uncommitted',
                            awards: [],
                            stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, minutesPlayed: 0 },
                            hometown: 'Bay Area, CA',
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-bold text-xs shadow transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Player</span>
                      </button>
                    </div>
                  </div>

                  {/* Roster Editor Sort & Filter Controls Toolbar */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search Field */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search roster by name, jersey #, position, high school..."
                        value={rosterFilterSearch}
                        onChange={(e) => setRosterFilterSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      {rosterFilterSearch && (
                        <button
                          onClick={() => setRosterFilterSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Sorting Dropdown & Quick Toggles */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-xs">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
                        <span className="text-slate-500 dark:text-slate-400 mr-1.5 text-[11px]">Sort By:</span>
                        <select
                          value={`${rosterSortField}-${rosterSortDir}`}
                          onChange={(e) => {
                            const [field, dir] = e.target.value.split('-') as [RosterEditorSortField, 'asc' | 'desc'];
                            setRosterSortField(field);
                            setRosterSortDir(dir);
                          }}
                          className="bg-transparent text-slate-900 dark:text-white font-bold outline-none cursor-pointer text-xs pr-1"
                        >
                          <option value="jerseyNumber-asc" className="bg-white dark:bg-slate-900">Jersey # (Ascending)</option>
                          <option value="jerseyNumber-desc" className="bg-white dark:bg-slate-900">Jersey # (Descending)</option>
                          <option value="name-asc" className="bg-white dark:bg-slate-900">Player Name (A-Z)</option>
                          <option value="name-desc" className="bg-white dark:bg-slate-900">Player Name (Z-A)</option>
                          <option value="position-asc" className="bg-white dark:bg-slate-900">Position Category</option>
                          <option value="gpa-desc" className="bg-white dark:bg-slate-900">GPA (Highest First)</option>
                          <option value="gpa-asc" className="bg-white dark:bg-slate-900">GPA (Lowest First)</option>
                          <option value="gradYear-asc" className="bg-white dark:bg-slate-900">Grad Year (Earliest)</option>
                          <option value="gradYear-desc" className="bg-white dark:bg-slate-900">Grad Year (Latest)</option>
                          <option value="ageGroup-asc" className="bg-white dark:bg-slate-900">Age Group (U14/U15/U16)</option>
                          <option value="commitment-asc" className="bg-white dark:bg-slate-900">Commitment Status</option>
                        </select>
                      </div>

                      {/* Quick Sort Pills */}
                      <button
                        type="button"
                        onClick={() => handleRosterSortToggle('jerseyNumber')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                          rosterSortField === 'jerseyNumber'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>#</span>
                        {rosterSortField === 'jerseyNumber' && (
                          rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRosterSortToggle('name')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                          rosterSortField === 'name'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>A-Z</span>
                        {rosterSortField === 'name' && (
                          rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRosterSortToggle('gpa')}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 ${
                          rosterSortField === 'gpa'
                            ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span>GPA</span>
                        {rosterSortField === 'gpa' && (
                          rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Player List Table with Interactive Sortable Headers */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
                    <table className="w-full min-w-[800px] text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className="bg-slate-100 dark:bg-[#0e1628] font-condensed font-black text-xs uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 select-none">
                        <tr>
                          <th 
                            onClick={() => handleRosterSortToggle('jerseyNumber')}
                            className="py-2.5 px-3 w-14 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by Jersey Number"
                          >
                            <div className="flex items-center gap-1">
                              <span>#</span>
                              {rosterSortField === 'jerseyNumber' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleRosterSortToggle('name')}
                            className="py-2.5 px-3 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by Player Name"
                          >
                            <div className="flex items-center gap-1">
                              <span>Name</span>
                              {rosterSortField === 'name' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleRosterSortToggle('position')}
                            className="py-2.5 px-3 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by Position"
                          >
                            <div className="flex items-center gap-1">
                              <span>Position</span>
                              {rosterSortField === 'position' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleRosterSortToggle('ageGroup')}
                            className="py-2.5 px-3 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by Age Group"
                          >
                            <div className="flex items-center gap-1">
                              <span>Age Group</span>
                              {rosterSortField === 'ageGroup' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleRosterSortToggle('gradYear')}
                            className="py-2.5 px-3 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by Graduation Year"
                          >
                            <div className="flex items-center gap-1">
                              <span>Grad Year</span>
                              {rosterSortField === 'gradYear' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleRosterSortToggle('gpa')}
                            className="py-2.5 px-3 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by GPA"
                          >
                            <div className="flex items-center gap-1">
                              <span>GPA</span>
                              {rosterSortField === 'gpa' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleRosterSortToggle('commitment')}
                            className="py-2.5 px-3 cursor-pointer hover:bg-blue-900/30 hover:text-slate-900 dark:hover:text-white transition-colors group"
                            title="Click to sort by College Commitment"
                          >
                            <div className="flex items-center gap-1">
                              <span>Commitment</span>
                              {rosterSortField === 'commitment' ? (
                                rosterSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                              )}
                            </div>
                          </th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sortedAndFilteredLocalPlayers.map((player) => (
                          <tr key={player.id} className="hover:bg-white dark:hover:bg-slate-900/50 transition-colors">
                            <td className="py-2 px-3 font-condensed font-black text-sm text-slate-900 dark:text-white">
                              #{player.jerseyNumber}
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  key={`${player.id}_${player.photoUrl}`}
                                  src={getSafeImageSrc(player.photoUrl, DEFAULT_PLAYER_PHOTO)}
                                  alt={player.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                                  onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                                />
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white">{player.name}</span>
                                  {player.isCaptain && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-black text-black" />
                                      <span>C</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{player.specificPosition}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/60 font-mono text-[11px] text-[#00ADEF] font-bold">
                                {player.ageGroup || (player.birthYear === 2011 ? 'U15' : player.birthYear === 2012 ? 'U14' : player.birthYear === 2009 ? 'U17' : 'U16')}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400">Class of '{String(player.gradYear).slice(-2)}</td>
                            <td className="py-2 px-3 font-bold text-blue-400">{player.gpa}</td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{player.commitment}</td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setIsCreatingPlayer(false);
                                    setEditingPlayer(player);
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-950 text-blue-300 hover:bg-blue-600 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                  title="Edit player details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePlayerClick(player)}
                                  className="p-1.5 rounded-lg bg-red-950 text-red-300 hover:bg-red-600 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                  title="Delete player"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {sortedAndFilteredLocalPlayers.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      No players match "{rosterFilterSearch}". Try clearing the search.
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* TAB 2: COACHING STAFF */}
          {activeTab === 'coaches' && (
            <div className="space-y-6">
              {editingCoach ? (
                <form onSubmit={handleSaveCoachForm} className="space-y-4 bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-blue-900/50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                        {isCreatingCoach ? 'Add New Coach / Staff Member' : `Edit Coach: ${editingCoach.name}`}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Update coach profile, credentials, contact information, and biography.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCoach(null);
                        setIsCreatingCoach(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editingCoach.name}
                        onChange={(e) => setEditingCoach({ ...editingCoach, name: e.target.value })}
                        placeholder="e.g. Lloyd Grist"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Role / Staff Title</label>
                      <input
                        type="text"
                        required
                        value={editingCoach.role}
                        onChange={(e) => setEditingCoach({ ...editingCoach, role: e.target.value })}
                        placeholder="e.g. Head Coach"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {['Head Coach', 'Associate Head Coach', 'Technical Director', 'Recruiting Coordinator', 'Goalkeeper Coach', 'Team Manager'].map((roleOpt) => (
                          <button
                            key={roleOpt}
                            type="button"
                            onClick={() => setEditingCoach({ ...editingCoach, role: roleOpt })}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            {roleOpt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">License & Coaching Badges</label>
                      <input
                        type="text"
                        value={editingCoach.license}
                        onChange={(e) => setEditingCoach({ ...editingCoach, license: e.target.value })}
                        placeholder="e.g. USSF A-Senior National License"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Experience & Background</label>
                      <input
                        type="text"
                        value={editingCoach.experience}
                        onChange={(e) => setEditingCoach({ ...editingCoach, experience: e.target.value })}
                        placeholder="e.g. 12+ Years Elite Youth Development & ECNL"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editingCoach.email}
                        onChange={(e) => setEditingCoach({ ...editingCoach, email: e.target.value })}
                        placeholder="coach@deanzaforce.org"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editingCoach.phone}
                        onChange={(e) => setEditingCoach({ ...editingCoach, phone: e.target.value })}
                        placeholder="(408) 555-0142"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Alma Mater / Club Position</label>
                      <input
                        type="text"
                        value={editingCoach.almaMater || ''}
                        onChange={(e) => setEditingCoach({ ...editingCoach, almaMater: e.target.value })}
                        placeholder="e.g. De Anza Force Academy Director / Stanford University"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Photo URL</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="url"
                          value={editingCoach.photoUrl}
                          onChange={(e) => setEditingCoach({ ...editingCoach, photoUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                        />
                        <img
                          src={getSafeImageSrc(editingCoach.photoUrl, DEFAULT_COACH_PHOTO)}
                          alt={editingCoach.name || 'Preview'}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shrink-0"
                          onError={(e) => handleImageError(e, DEFAULT_COACH_PHOTO)}
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>Sample Photos:</span>
                        <button
                          type="button"
                          onClick={() => setEditingCoach({ ...editingCoach, photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80' })}
                          className="underline hover:text-slate-900 dark:hover:text-white"
                        >
                          Coach A
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setEditingCoach({ ...editingCoach, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80' })}
                          className="underline hover:text-slate-900 dark:hover:text-white"
                        >
                          Coach B
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setEditingCoach({ ...editingCoach, photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80' })}
                          className="underline hover:text-slate-900 dark:hover:text-white"
                        >
                          Coach C
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setEditingCoach({ ...editingCoach, photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80' })}
                          className="underline hover:text-slate-900 dark:hover:text-white"
                        >
                          Coach D
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Biography & Coaching Philosophy</label>
                      <textarea
                        rows={3}
                        value={editingCoach.bio}
                        onChange={(e) => setEditingCoach({ ...editingCoach, bio: e.target.value })}
                        placeholder="Describe coaching background, achievements, collegiate experience, and development focus..."
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    {!isCreatingCoach && editingCoach ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteCoachClick(editingCoach)}
                        className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Coach</span>
                      </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCoach(null);
                          setIsCreatingCoach(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-md shadow-blue-900/30 cursor-pointer"
                      >
                        {isCreatingCoach ? 'Add Staff Member' : 'Save Coach Profile'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  {/* Header & Add Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Coaching & Technical Staff Roster</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                          {localCoaches.length} Staff
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage head coaches, recruiting directors, goalkeeper specialists, and staff contacts.
                      </p>
                    </div>

                    <button
                      onClick={handleCreateNewCoach}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Coach / Staff</span>
                    </button>
                  </div>

                  {/* Coaches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {localCoaches.map((coach) => (
                      <div
                        key={coach.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 flex flex-col justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={getSafeImageSrc(coach.photoUrl, DEFAULT_COACH_PHOTO)}
                            alt={coach.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shrink-0"
                            onError={(e) => handleImageError(e, DEFAULT_COACH_PHOTO)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-condensed font-black text-lg text-slate-900 dark:text-white uppercase leading-tight">
                                {coach.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                                {coach.role}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-blue-400 mt-1 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                              <span className="truncate">{coach.license}</span>
                            </p>

                            <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1.5 truncate">
                                <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate">{coach.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{coach.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {coach.experience}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setIsCreatingCoach(false);
                                setEditingCoach(coach);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-600 text-blue-300 hover:text-slate-900 dark:hover:text-white border border-blue-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCoachClick(coach)}
                              className="p-1 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-slate-900 dark:hover:text-white border border-red-800 transition-colors cursor-pointer"
                              title="Delete coach"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULE & MATCHES */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                    Match Fixtures & Schedule Details ({localMatches.length} Matches)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Edit complete kickoff times, venues, field numbers, map addresses, home/away status, live streams, and match results.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleAutoSyncRecordAndForm}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs border border-blue-500/40 transition-colors cursor-pointer shrink-0"
                    title="Auto-sync standings table and season record from completed match scores"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#00ADEF]" />
                    <span>Auto-Sync Record & Form</span>
                  </button>

                  <button
                    onClick={() => {
                      const newMatch: Match = {
                        id: `match_${Date.now()}`,
                        date: new Date().toISOString().split('T')[0],
                        time: '11:00 AM PST',
                        opponent: 'New Opponent ECNL',
                        opponentLocation: 'Bay Area, CA',
                        isHome: true,
                        competition: 'ECNL Northern California',
                        venue: 'De Anza College Stadium',
                        fieldNumber: 'Stadium Turf',
                        address: '21250 Stevens Creek Blvd, Cupertino, CA 95014',
                        mapUrl: 'https://maps.google.com/?q=De+Anza+College+Cupertino+CA',
                        status: 'upcoming',
                        homeKitColor: 'Royal Blue & Black',
                        awayKitColor: 'Solid Black',
                      };
                      setLocalMatches([newMatch, ...localMatches]);
                      showNotification('Added new match fixture.');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-bold text-xs cursor-pointer shrink-0 shadow-lg shadow-blue-900/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Match</span>
                  </button>
                </div>
              </div>

              {/* Automated Record & Form Maintenance Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-[#00ADEF] border border-blue-500/30 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Live Computed Record & Form
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-calculated from completed match fixtures
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 font-condensed font-black text-sm text-slate-900 dark:text-white">
                      <span>Season Record:</span>
                      <span className="text-emerald-400">{computedMatchRecord.wins}W</span>
                      <span className="text-slate-500">-</span>
                      <span className="text-red-400">{computedMatchRecord.losses}L</span>
                      <span className="text-slate-500">-</span>
                      <span className="text-amber-400">{computedMatchRecord.draws}D</span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal">({computedMatchRecord.points} pts, {computedMatchRecord.played} GP)</span>
                    </div>

                    <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">Past 5 Form:</span>
                      <div className="flex items-center gap-1">
                        {computedMatchRecord.form.map((f, i) => (
                          <span 
                            key={i} 
                            className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] ${
                              f === 'W' ? 'bg-emerald-600 text-slate-900 dark:text-white' :
                              f === 'L' ? 'bg-red-600 text-slate-900 dark:text-white' :
                              f === 'D' ? 'bg-amber-600 text-slate-900 dark:text-white' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                      GD: <span className={computedMatchRecord.goalDifference >= 0 ? 'text-emerald-400' : 'text-red-400'}>{computedMatchRecord.goalDifference >= 0 ? `+${computedMatchRecord.goalDifference}` : computedMatchRecord.goalDifference}</span> (GF: {computedMatchRecord.goalsFor}, GA: {computedMatchRecord.goalsAgainst})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoSyncRecordAndForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00ADEF] hover:bg-blue-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-blue-900/40 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  title="Auto-update conference standings table and team header record to match fixture results"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Sync Standings & Record Now</span>
                </button>
              </div>

              <div className="space-y-4">
                {localMatches.map((m, index) => (
                  <div 
                    key={m.id} 
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 transition-all text-xs space-y-4 shadow-xl"
                  >
                    {/* Header bar of Match Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-condensed font-black text-sm text-slate-900 dark:text-white px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                          Match #{index + 1}
                        </span>
                        <span className="font-condensed font-black text-sm text-slate-900 dark:text-white">
                          De Anza Force{' '}
                          <span className={m.isHome ? 'text-slate-500 dark:text-slate-400 font-bold' : 'text-amber-400 font-black'}>
                            {m.isHome ? 'vs' : 'at'}
                          </span>{' '}
                          {m.opponent || 'Opponent'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          m.status === 'completed' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                            : m.status === 'live' 
                            ? 'bg-red-950 text-red-300 border border-red-700/60 animate-pulse' 
                            : 'bg-blue-950 text-blue-300 border border-blue-700/60'
                        }`}>
                          {m.status} {m.status === 'completed' && `(${m.teamScore ?? 0} - ${m.opponentScore ?? 0})`}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-condensed font-black uppercase tracking-wider ${
                          m.isHome ? 'bg-blue-950/90 text-[#00ADEF] border border-blue-800/80' : 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
                        }`}>
                          {m.isHome ? 'HOME (vs)' : 'AWAY (at)'}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{m.competition}</span>
                      </div>

                      <button
                        onClick={() => {
                          setLocalMatches(localMatches.filter((_, i) => i !== index));
                          showNotification('Removed match fixture.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-600 hover:text-slate-900 dark:hover:text-white border border-red-800/50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
                      {/* Date */}
                      <div className="sm:col-span-1 lg:col-span-3">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          Match Date
                        </label>
                        <input
                          type="date"
                          value={m.date}
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].date = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Time */}
                      <div className="sm:col-span-1 lg:col-span-3">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          Kickoff Time (with Timezone)
                        </label>
                        <input
                          type="text"
                          value={m.time}
                          placeholder="e.g. 11:00 AM PST"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].time = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Opponent Name */}
                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-400" />
                          Opponent Team Name
                        </label>
                        <input
                          type="text"
                          value={m.opponent}
                          placeholder="e.g. MVLA SC ECNL G2010"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].opponent = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Home / Away Toggle */}
                      <div className="sm:col-span-1 lg:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">Home / Away</label>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...localMatches];
                              updated[index].isHome = true;
                              setLocalMatches(updated);
                            }}
                            className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              m.isHome 
                                ? 'bg-blue-600 text-slate-900 dark:text-white shadow' 
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            Home
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...localMatches];
                              updated[index].isHome = false;
                              setLocalMatches(updated);
                            }}
                            className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              !m.isHome 
                                ? 'bg-amber-600 text-slate-900 dark:text-white shadow' 
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            Away
                          </button>
                        </div>
                      </div>

                      {/* Competition */}
                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          Competition / League
                        </label>
                        <select
                          value={m.competition}
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].competition = e.target.value as any;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                        >
                          <option value="ECNL Northern California">ECNL Northern California</option>
                          <option value="Surf Cup">Surf Cup (Super White Division)</option>
                          <option value="ECNL National Showcase">ECNL National Showcase</option>
                          <option value="SilverLakes Showcase">SilverLakes College Showcase</option>
                          <option value="NorCal State Cup">NorCal State Cup</option>
                          <option value="Friendly">Pre-Season / Friendly</option>
                        </select>
                      </div>

                      {/* Opponent City / Region */}
                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Opponent Location / City</label>
                        <input
                          type="text"
                          value={m.opponentLocation || ''}
                          placeholder="e.g. San Jose, CA or Mountain View, CA"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].opponentLocation = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Status & Scores */}
                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Match Status & Result</label>
                        <div className="flex items-center gap-2 mt-1">
                          <select
                            value={m.status}
                            onChange={(e) => {
                              const updated = [...localMatches];
                              updated[index].status = e.target.value as any;
                              setLocalMatches(updated);
                            }}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none cursor-pointer shrink-0"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">LIVE</option>
                            <option value="completed">Completed</option>
                          </select>

                          {(m.status === 'completed' || m.status === 'live') && (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                              <div className="text-center">
                                <span className="text-[9px] text-blue-400 block font-bold">Force</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={m.teamScore ?? 0}
                                  onChange={(e) => {
                                    const updated = [...localMatches];
                                    updated[index].teamScore = parseInt(e.target.value, 10) || 0;
                                    setLocalMatches(updated);
                                  }}
                                  className="w-10 p-1 text-center font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700"
                                />
                              </div>
                              <span className="text-slate-500 font-bold">-</span>
                              <div className="text-center">
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold">Opp</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={m.opponentScore ?? 0}
                                  onChange={(e) => {
                                    const updated = [...localMatches];
                                    updated[index].opponentScore = parseInt(e.target.value, 10) || 0;
                                    setLocalMatches(updated);
                                  }}
                                  className="w-10 p-1 text-center font-black text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Venue Name */}
                      <div className="sm:col-span-1 lg:col-span-4">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          Venue / Stadium Name
                        </label>
                        <input
                          type="text"
                          value={m.venue}
                          placeholder="e.g. De Anza College Stadium"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].venue = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Field # */}
                      <div className="sm:col-span-1 lg:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Field / Pitch #</label>
                        <input
                          type="text"
                          value={m.fieldNumber || ''}
                          placeholder="e.g. Stadium Turf"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].fieldNumber = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Full Street Address */}
                      <div className="sm:col-span-1 lg:col-span-6">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Full Venue Address (for GPS & Nav)</label>
                        <input
                          type="text"
                          value={m.address}
                          placeholder="e.g. 21250 Stevens Creek Blvd, Cupertino, CA 95014"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].address = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Google Maps URL */}
                      <div className="sm:col-span-1 lg:col-span-6">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-blue-400" />
                          Google Maps URL Link
                        </label>
                        <input
                          type="url"
                          value={m.mapUrl}
                          placeholder="https://maps.google.com/?q=..."
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].mapUrl = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Livestream / Match Video URL */}
                      <div className="sm:col-span-1 lg:col-span-6">
                        <label className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                          <Video className="w-3 h-3 text-red-400" />
                          Livestream / Match Film URL (YouTube, Veo, Hudl)
                        </label>
                        <input
                          type="url"
                          value={m.videoLiveStreamUrl || ''}
                          placeholder="https://youtube.com/live/... or https://app.veo.co/..."
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].videoLiveStreamUrl = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      {/* Uniform Kit Colors */}
                      <div className="sm:col-span-1 lg:col-span-3">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Home Kit Assignment</label>
                        <input
                          type="text"
                          value={m.homeKitColor}
                          placeholder="e.g. Royal Blue & Black"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].homeKitColor = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-1 lg:col-span-3">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Away Kit Assignment</label>
                        <input
                          type="text"
                          value={m.awayKitColor}
                          placeholder="e.g. Solid Black"
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].awayKitColor = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Game Notes / Scorers */}
                      <div className="sm:col-span-2 lg:col-span-12">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Match Notes, Goal Scorers & Scouting Highlights</label>
                        <input
                          type="text"
                          value={m.gameNotes || ''}
                          placeholder="e.g. Clean sheet victory; goals by Chamberlain (2), Ranaweera (1). Assist: Laxague."
                          onChange={(e) => {
                            const updated = [...localMatches];
                            updated[index].gameNotes = e.target.value;
                            setLocalMatches(updated);
                          }}
                          className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STANDINGS & RECORD */}
          {activeTab === 'standings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white mb-1">
                    Team Season Record & Rankings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update overall wins, losses, draws, goal difference, and clean sheets displayed in the Hero banner.
                  </p>
                </div>

                <a
                  href="https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30 transition-colors self-start sm:self-auto"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>View Official ECNL NorCal Table</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Wins (W)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.wins}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, wins: parseInt(e.target.value, 10) || 0 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Losses (L)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.losses}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, losses: parseInt(e.target.value, 10) || 0 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Draws (D)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.draws}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, draws: parseInt(e.target.value, 10) || 0 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Clean Sheets</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.cleanSheets}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, cleanSheets: parseInt(e.target.value, 10) || 0 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Goals For (GF)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.goalsFor}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, goalsFor: parseInt(e.target.value, 10) || 0 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Goals Against (GA)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.goalsAgainst}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, goalsAgainst: parseInt(e.target.value, 10) || 0 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">NorCal ECNL Rank (#)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.norcalRank}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, norcalRank: parseInt(e.target.value, 10) || 1 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-yellow-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">National Rank (#)</label>
                  <input
                    type="number"
                    value={localTeamInfo.seasonRecord.nationalRank}
                    onChange={(e) => setLocalTeamInfo({
                      ...localTeamInfo,
                      seasonRecord: { ...localTeamInfo.seasonRecord, nationalRank: parseInt(e.target.value, 10) || 6 }
                    })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-blue-400 font-bold"
                  />
                </div>
              </div>

              {/* SECTION: ECNL STANDINGS TABLE EDITOR */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white mb-0.5 flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-[#00ADEF]" />
                      <span>NorCal U16 Conference Table ({localStandings.length} Teams)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage positions, club names, GP, W-L-D, GF, GA, and qualification statuses.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleAutoSyncRecordAndForm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 dark:text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                      title="Auto-sync Force record and past 5 match form directly from completed match results"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sync Force from Schedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Auto calculate PPG, GD, Points and sort by Points desc, GD desc, GF desc
                        const sorted = [...localStandings].map(team => {
                          const w = team.won ?? team.wins ?? 0;
                          const d = team.drawn ?? team.draws ?? 0;
                          const l = team.lost ?? team.losses ?? 0;
                          const gp = team.played ?? team.gamesPlayed ?? (w + d + l);
                          const points = (w * 3) + d;
                          const gd = team.goalsFor - team.goalsAgainst;
                          const ppg = gp > 0 ? Number((points / gp).toFixed(2)) : 0;
                          return { 
                            ...team, 
                            played: gp,
                            gamesPlayed: gp,
                            won: w,
                            wins: w,
                            drawn: d,
                            draws: d,
                            lost: l,
                            losses: l,
                            points, 
                            goalDifference: gd, 
                            pointsPerGame: ppg 
                          };
                        }).sort((a, b) => {
                          if (b.points !== a.points) return b.points - a.points;
                          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                          return b.goalsFor - a.goalsFor;
                        }).map((team, idx) => ({ ...team, rank: idx + 1 }));

                        setLocalStandings(sorted);
                        onSaveStandings(sorted);
                        showNotification('✓ Recalculated Points, Goal Difference, PPG, and re-ranked table!');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold border border-blue-500/30 transition-colors cursor-pointer"
                      title="Calculate points (W*3+D) and auto sort rankings"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Auto-Calculate & Sort</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newTeam: StandingTeam = {
                          rank: localStandings.length + 1,
                          teamName: 'New NorCal Club',
                          played: 0,
                          gamesPlayed: 0,
                          won: 0,
                          wins: 0,
                          lost: 0,
                          losses: 0,
                          drawn: 0,
                          draws: 0,
                          goalsFor: 0,
                          goalsAgainst: 0,
                          goalDifference: 0,
                          points: 0,
                          pointsPerGame: 0,
                          form: ['-', '-', '-', '-', '-'],
                          isForce: false,
                          isCurrentTeam: false,
                          qualification: 'Conference Play'
                        };
                        const updated = [...localStandings, newTeam];
                        setLocalStandings(updated);
                        onSaveStandings(updated);
                        showNotification('✓ Added new team to standings table.');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Club</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset standings table to default NorCal U16 ECNL league data?')) {
                          setLocalStandings(INITIAL_STANDINGS);
                          onSaveStandings(INITIAL_STANDINGS);
                          showNotification('✓ Reset standings table to default ECNL league data.');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                      title="Reset to default league table"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Table</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Table of Standings */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                  <table className="w-full min-w-[800px] text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="bg-white dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5 text-center w-12">Rank</th>
                        <th className="p-2.5 min-w-[180px]">Club Name</th>
                        <th className="p-2.5 text-center w-12">Force?</th>
                        <th className="p-2.5 text-center w-14">GP</th>
                        <th className="p-2.5 text-center w-14">W</th>
                        <th className="p-2.5 text-center w-14">L</th>
                        <th className="p-2.5 text-center w-14">D</th>
                        <th className="p-2.5 text-center w-14">GF</th>
                        <th className="p-2.5 text-center w-14">GA</th>
                        <th className="p-2.5 text-center w-14">GD</th>
                        <th className="p-2.5 text-center w-14">PTS</th>
                        <th className="p-2.5 text-center w-16">PPG</th>
                        <th className="p-2.5 text-center min-w-[160px]">Past 5 Matches (Form)</th>
                        <th className="p-2.5 min-w-[150px]">Qualification Note</th>
                        <th className="p-2.5 text-center w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {localStandings.map((team, index) => (
                        <tr 
                          key={index} 
                          className={`hover:bg-white dark:hover:bg-slate-900/50 transition-colors ${team.isForce ? 'bg-blue-950/30' : ''}`}
                        >
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.rank}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                const updated = localStandings.map((t, i) => i === index ? { ...t, rank: val } : t);
                                setLocalStandings(updated);
                              }}
                              className="w-10 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={team.teamName}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = localStandings.map((t, i) => i === index ? { ...t, teamName: val } : t);
                                setLocalStandings(updated);
                              }}
                              className={`w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold ${team.isForce ? 'text-[#00ADEF]' : 'text-slate-900 dark:text-white'}`}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!(team.isForce ?? team.isCurrentTeam)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const updated = localStandings.map((t, i) => i === index ? { ...t, isForce: checked, isCurrentTeam: checked } : t);
                                setLocalStandings(updated);
                              }}
                              className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                              title="Mark as De Anza Force row"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.played ?? team.gamesPlayed ?? 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => i === index ? { 
                                  ...t, 
                                  played: val,
                                  gamesPlayed: val,
                                  pointsPerGame: val > 0 ? Number((t.points / val).toFixed(2)) : 0
                                } : t);
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.won ?? team.wins ?? 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => {
                                  if (i !== index) return t;
                                  const d = t.drawn ?? t.draws ?? 0;
                                  const l = t.lost ?? t.losses ?? 0;
                                  const pts = (val * 3) + d;
                                  const gp = val + l + d;
                                  return { 
                                    ...t, 
                                    won: val,
                                    wins: val, 
                                    played: gp,
                                    gamesPlayed: gp, 
                                    points: pts,
                                    pointsPerGame: gp > 0 ? Number((pts / gp).toFixed(2)) : 0
                                  };
                                });
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-emerald-400 font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.lost ?? team.losses ?? 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => {
                                  if (i !== index) return t;
                                  const w = t.won ?? t.wins ?? 0;
                                  const d = t.drawn ?? t.draws ?? 0;
                                  const gp = w + val + d;
                                  return { 
                                    ...t, 
                                    lost: val,
                                    losses: val, 
                                    played: gp,
                                    gamesPlayed: gp, 
                                    pointsPerGame: gp > 0 ? Number((t.points / gp).toFixed(2)) : 0
                                  };
                                });
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-rose-400 font-bold"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.drawn ?? team.draws ?? 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => {
                                  if (i !== index) return t;
                                  const w = t.won ?? t.wins ?? 0;
                                  const l = t.lost ?? t.losses ?? 0;
                                  const pts = (w * 3) + val;
                                  const gp = w + l + val;
                                  return { 
                                    ...t, 
                                    drawn: val,
                                    draws: val, 
                                    played: gp,
                                    gamesPlayed: gp, 
                                    points: pts,
                                    pointsPerGame: gp > 0 ? Number((pts / gp).toFixed(2)) : 0
                                  };
                                });
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.goalsFor}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => i === index ? { 
                                  ...t, 
                                  goalsFor: val, 
                                  goalDifference: val - t.goalsAgainst 
                                } : t);
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.goalsAgainst}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => i === index ? { 
                                  ...t, 
                                  goalsAgainst: val, 
                                  goalDifference: t.goalsFor - val 
                                } : t);
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.goalDifference}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => i === index ? { 
                                  ...t, 
                                  goalDifference: val 
                                } : t);
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              value={team.points}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                const updated = localStandings.map((t, i) => {
                                  if (i !== index) return t;
                                  const gp = t.played ?? t.gamesPlayed ?? 0;
                                  return {
                                    ...t, 
                                    points: val,
                                    pointsPerGame: gp > 0 ? Number((val / gp).toFixed(2)) : 0 
                                  };
                                });
                                setLocalStandings(updated);
                              }}
                              className="w-12 text-center p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-yellow-400 font-black"
                            />
                          </td>
                          <td className="p-2 text-center font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                            {team.pointsPerGame?.toFixed(2) || '0.00'}
                          </td>
                          {/* Past 5 Matches Form Editor */}
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {[0, 1, 2, 3, 4].map((slotIdx) => {
                                const formArr = (team.form && team.form.length === 5) 
                                  ? team.form 
                                  : (Array.isArray(team.form) && team.form.length > 0 
                                      ? [...team.form, '-', '-', '-', '-', '-'].slice(0, 5) as ('W' | 'D' | 'L' | '-')[]
                                      : ['-', '-', '-', '-', '-'] as ('W' | 'D' | 'L' | '-')[]);
                                const val = formArr[slotIdx] || '-';
                                return (
                                  <button
                                    key={slotIdx}
                                    type="button"
                                    onClick={() => {
                                      const nextVal: 'W' | 'D' | 'L' | '-' = 
                                        val === 'W' ? 'D' : val === 'D' ? 'L' : val === 'L' ? '-' : 'W';
                                      const updatedForm: ('W' | 'D' | 'L' | '-')[] = [...formArr];
                                      updatedForm[slotIdx] = nextVal;
                                      const updated = localStandings.map((t, i) => i === index ? { ...t, form: updatedForm } : t);
                                      setLocalStandings(updated);
                                    }}
                                    title={`Match #${5 - slotIdx}: ${val === 'W' ? 'Win' : val === 'D' ? 'Draw' : val === 'L' ? 'Loss' : 'Not Played'} (Click to cycle W → D → L → -)`}
                                    className={`w-6 h-6 rounded-md font-condensed font-black text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                                      val === 'W'
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white shadow-emerald-950/40'
                                        : val === 'D'
                                        ? 'bg-amber-600 hover:bg-amber-500 text-slate-900 dark:text-white shadow-amber-950/40'
                                        : val === 'L'
                                        ? 'bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white shadow-rose-950/40'
                                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                            <span className="text-[8px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
                              Click pill to cycle (W/D/L/-)
                            </span>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={team.qualification || ''}
                              placeholder="e.g. Champions League Playoffs"
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = localStandings.map((t, i) => i === index ? { ...t, qualification: val } : t);
                                setLocalStandings(updated);
                              }}
                              className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] text-emerald-400"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localStandings];
                                    const temp = updated[index - 1];
                                    updated[index - 1] = updated[index];
                                    updated[index] = temp;
                                    // Update ranks
                                    updated.forEach((t, i) => { t.rank = i + 1; });
                                    setLocalStandings(updated);
                                  }}
                                  className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  title="Move Up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {index < localStandings.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localStandings];
                                    const temp = updated[index + 1];
                                    updated[index + 1] = updated[index];
                                    updated[index] = temp;
                                    // Update ranks
                                    updated.forEach((t, i) => { t.rank = i + 1; });
                                    setLocalStandings(updated);
                                  }}
                                  className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                  title="Move Down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (localStandings.length <= 1) {
                                    alert('Must have at least one team in table.');
                                    return;
                                  }
                                  const updated = localStandings.filter((_, i) => i !== index).map((t, i) => ({ ...t, rank: i + 1 }));
                                  setLocalStandings(updated);
                                  showNotification(`✓ Removed ${team.teamName} from standings.`);
                                }}
                                className="p-1 rounded bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                title="Delete Club"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Top 2 teams qualify for ECNL National Playoffs (Champions League)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSaveStandings(localStandings);
                      onSaveTeamInfo(localTeamInfo);
                      showNotification('✓ Saved Standings & Record changes to live site!');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00ADEF] hover:bg-[#0095ce] text-slate-950 font-black uppercase text-xs tracking-wider transition-colors shadow-lg cursor-pointer"
                  >
                    Save Standings Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM INFO & COACHES */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white mb-1">
                  Team Identity & Facility Details
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Club & Team Name</label>
                  <input
                    type="text"
                    value={localTeamInfo.teamName}
                    onChange={(e) => setLocalTeamInfo({ ...localTeamInfo, teamName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Age Group / Birth Year</label>
                  <input
                    type="text"
                    value={localTeamInfo.ageGroup}
                    onChange={(e) => setLocalTeamInfo({ ...localTeamInfo, ageGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Home Facility</label>
                  <input
                    type="text"
                    value={localTeamInfo.homeFacility}
                    onChange={(e) => setLocalTeamInfo({ ...localTeamInfo, homeFacility: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Facility Address</label>
                  <input
                    type="text"
                    value={localTeamInfo.facilityAddress}
                    onChange={(e) => setLocalTeamInfo({ ...localTeamInfo, facilityAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <label className="block text-slate-900 dark:text-white font-bold mb-0.5">Show College Recruitment Hub</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enable this section when the spring college showcase season begins.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={localTeamInfo.showRecruitmentHub !== false}
                      onChange={(e) => setLocalTeamInfo({ ...localTeamInfo, showRecruitmentHub: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-100 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <TeamPhotoManager
                    currentPhotoUrl={localTeamInfo.teamPhotoUrl}
                    currentCaption={localTeamInfo.teamPhotoCaption}
                    onUpdate={(url, caption) => {
                      const updatedInfo = {
                        ...localTeamInfo,
                        teamPhotoUrl: url,
                        teamPhotoCaption: caption || localTeamInfo.teamPhotoCaption
                      };
                      setLocalTeamInfo(updatedInfo);
                      onSaveTeamInfo(updatedInfo);
                      showNotification('✓ Updated official squad photo!');
                    }}
                    onRemove={() => {
                      const updatedInfo = {
                        ...localTeamInfo,
                        teamPhotoUrl: '',
                      };
                      setLocalTeamInfo(updatedInfo);
                      onSaveTeamInfo(updatedInfo);
                      showNotification('✓ Removed team squad photo.');
                    }}
                    onRestoreDefault={() => {
                      const defaultUrl = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=80';
                      const defaultCaption = '2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff';
                      const updatedInfo = {
                        ...localTeamInfo,
                        teamPhotoUrl: defaultUrl,
                        teamPhotoCaption: defaultCaption
                      };
                      setLocalTeamInfo(updatedInfo);
                      onSaveTeamInfo(updatedInfo);
                      showNotification('✓ Restored default squad photo.');
                    }}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-condensed font-black text-lg uppercase text-slate-900 dark:text-white mb-2">
                  Top Announcement Notification Banner
                </h4>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show_announcement"
                      checked={localTeamInfo.announcement.show}
                      onChange={(e) => setLocalTeamInfo({
                        ...localTeamInfo,
                        announcement: { ...localTeamInfo.announcement, show: e.target.checked }
                      })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <label htmlFor="show_announcement" className="text-slate-900 dark:text-white font-bold">Display Banner at Top of Website</label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1">Badge Text</label>
                      <input
                        type="text"
                        value={localTeamInfo.announcement.badge}
                        onChange={(e) => setLocalTeamInfo({
                          ...localTeamInfo,
                          announcement: { ...localTeamInfo.announcement, badge: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1">Announcement Message</label>
                      <input
                        type="text"
                        value={localTeamInfo.announcement.text}
                        onChange={(e) => setLocalTeamInfo({
                          ...localTeamInfo,
                          announcement: { ...localTeamInfo.announcement, text: e.target.value }
                        })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTION PHOTOS & GOOGLE PHOTOS ALBUMS MANAGER */}
          {activeTab === 'media' && (
            <div className="space-y-8">
              {/* SECTION 0: OFFICIAL SQUAD PORTRAIT PHOTO (TEAM BANNER & ROSTER) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[#00ADEF] shadow-inner">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-slate-900 dark:text-white font-condensed tracking-wider">
                          Official Showcase
                        </span>
                        <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white tracking-wide">
                          Official Squad Portrait & Team Photo
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage the team portrait image displayed in the Official Squad Showcase banner above the player roster and in recruitment packs.
                      </p>
                    </div>
                  </div>
                </div>

                <TeamPhotoManager
                  currentPhotoUrl={localTeamInfo.teamPhotoUrl}
                  currentCaption={localTeamInfo.teamPhotoCaption}
                  onUpdate={(url, caption) => {
                    const updatedInfo = {
                      ...localTeamInfo,
                      teamPhotoUrl: url,
                      teamPhotoCaption: caption || localTeamInfo.teamPhotoCaption
                    };
                    setLocalTeamInfo(updatedInfo);
                    onSaveTeamInfo(updatedInfo);
                    showNotification('✓ Updated official squad photo!');
                  }}
                  onRemove={() => {
                    const updatedInfo = {
                      ...localTeamInfo,
                      teamPhotoUrl: '',
                    };
                    setLocalTeamInfo(updatedInfo);
                    onSaveTeamInfo(updatedInfo);
                    showNotification('✓ Removed team squad photo.');
                  }}
                  onRestoreDefault={() => {
                    const defaultUrl = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=80';
                    const defaultCaption = '2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff';
                    const updatedInfo = {
                      ...localTeamInfo,
                      teamPhotoUrl: defaultUrl,
                      teamPhotoCaption: defaultCaption
                    };
                    setLocalTeamInfo(updatedInfo);
                    onSaveTeamInfo(updatedInfo);
                    showNotification('✓ Restored default squad photo.');
                  }}
                />
              </div>

              {/* SECTION 1: PERMANENT MASTER TEAM ALBUM LIST (LINKTREE / WILLOW GLEN PHOTOGRAPHY) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0e1d3d] via-[#09152b] to-[#0a1020] border border-blue-600/60 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-[#00ADEF] shadow-inner">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#00ADEF] text-slate-950 font-condensed tracking-wider">
                          Permanent Link
                        </span>
                        <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white tracking-wide">
                          Master Team Album List & Photo Hub
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Set the permanent master gallery URL (e.g., Willow Glen Photography Linktree). This link is permanently featured at the top of the Google Photos panel.
                      </p>
                    </div>
                  </div>

                  <a
                    href={masterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-bold transition-colors shrink-0"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#00ADEF]" />
                  </a>
                </div>

                <form onSubmit={handleSaveMasterLink} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">
                        Permanent Master Album List URL *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://linktr.ee/willow_glen_photography"
                        value={masterUrl}
                        onChange={(e) => setMasterUrl(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-blue-500/40 text-slate-900 dark:text-white text-xs focus:border-blue-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        Gallery Hub Title
                      </label>
                      <input
                        type="text"
                        placeholder="Willow Glen Photography • Team Photo Hub"
                        value={masterTitle}
                        onChange={(e) => setMasterTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        Photographer / Credit Name
                      </label>
                      <input
                        type="text"
                        placeholder="Willow Glen Photography"
                        value={masterPhotographer}
                        onChange={(e) => setMasterPhotographer(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                        Subtitle / Description
                      </label>
                      <input
                        type="text"
                        placeholder="Official team matchday albums, high-resolution tournament archives, and downloadable player galleries."
                        value={masterSubtitle}
                        onChange={(e) => setMasterSubtitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-700/30 transition-all border border-blue-400/40 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Master Permanent Link</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 2: SPECIFIC MATCH & EVENT GOOGLE PHOTOS ALBUMS */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white tracking-wide">
                        Match & Event Albums ({localAlbums.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add, edit, and organize individual match or tournament galleries (Google Photos, Linktree, or custom albums).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAddingAlbum(!isAddingAlbum);
                      setEditingAlbum(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingAlbum ? 'Cancel' : '+ Add Match Album'}</span>
                  </button>
                </div>

                {/* Add Album Form */}
                {isAddingAlbum && (
                  <form onSubmit={handleAddAlbumSubmit} className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1322] border border-emerald-600/40 shadow-xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-emerald-400" />
                        <span>Add New Match Album Link</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingAlbum(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Album Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., ECNL Round 1 vs San Juan SC"
                          value={newAlbumTitle}
                          onChange={(e) => setNewAlbumTitle(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Album URL * (Google Photos, Linktree, or gallery link)
                        </label>
                        <input
                          type="url"
                          required
                          placeholder="https://photos.app.goo.gl/... or https://..."
                          value={newAlbumUrl}
                          onChange={(e) => setNewAlbumUrl(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Subtitle / Highlights
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 3-1 Win in Davis, CA"
                          value={newAlbumSubtitle}
                          onChange={(e) => setNewAlbumSubtitle(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Match / Event Date
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Spring 2026 Season"
                          value={newAlbumDate}
                          onChange={(e) => setNewAlbumDate(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Badge Tag (e.g. Matchday, Showcase, Tournament)
                        </label>
                        <input
                          type="text"
                          placeholder="Matchday"
                          value={newAlbumBadge}
                          onChange={(e) => setNewAlbumBadge(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Photo Count Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 120+ Photos"
                          value={newAlbumPhotoCount}
                          onChange={(e) => setNewAlbumPhotoCount(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                          Cover Image URL or Device Upload (Optional)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... or direct image link"
                            value={newAlbumCover}
                            onChange={(e) => setNewAlbumCover(e.target.value)}
                            className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-emerald-500 font-mono"
                          />
                          <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setNewAlbumCover(event.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsAddingAlbum(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow"
                      >
                        Save Match Album
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit Album Modal/Form */}
                {editingAlbum && (
                  <form onSubmit={handleSaveEditedAlbum} className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1322] border border-blue-500/60 shadow-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-blue-400" />
                        <span>Edit Album: {editingAlbum.title}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingAlbum(null)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Album Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingAlbum.title}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Album URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={editingAlbum.albumUrl}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, albumUrl: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Subtitle / Highlights
                        </label>
                        <input
                          type="text"
                          value={editingAlbum.subtitle || ''}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, subtitle: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Match / Event Date
                        </label>
                        <input
                          type="text"
                          value={editingAlbum.date || ''}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, date: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Badge Tag
                        </label>
                        <input
                          type="text"
                          value={editingAlbum.badge || ''}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, badge: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                          Photo Count
                        </label>
                        <input
                          type="text"
                          value={editingAlbum.photoCount || ''}
                          onChange={(e) => setEditingAlbum({ ...editingAlbum, photoCount: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                          Cover Image URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={editingAlbum.coverImageUrl}
                            onChange={(e) => setEditingAlbum({ ...editingAlbum, coverImageUrl: e.target.value })}
                            className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                          />
                          <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0">
                            <Upload className="w-3.5 h-3.5 text-blue-400" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setEditingAlbum(prev => prev ? { ...prev, coverImageUrl: event.target?.result as string } : null);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingAlbum(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow"
                      >
                        Save Album Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Google Photos Albums Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {localAlbums.map((album, idx) => (
                    <div 
                      key={album.id}
                      className="group relative rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-emerald-500/60 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={getSafeImageSrc(album.coverImageUrl, DEFAULT_ACTION_PHOTOS[0].url)}
                          alt={album.title}
                          onError={(e) => handleImageError(e, DEFAULT_ACTION_PHOTOS[0].url)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black/70 text-emerald-400 border border-emerald-500/40">
                          {album.badge || 'Matchday'}
                        </span>

                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAlbum(album);
                              setIsAddingAlbum(false);
                            }}
                            className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-600 text-blue-300 hover:text-slate-900 dark:hover:text-white border border-blue-800/80 transition-colors cursor-pointer"
                            title="Edit album details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAlbum(album.id)}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-slate-900 dark:hover:text-white border border-red-800/80 transition-colors cursor-pointer"
                            title="Delete match album link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="font-condensed font-black text-sm text-slate-900 dark:text-white uppercase line-clamp-1">
                            {album.title}
                          </h5>
                          {album.subtitle && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {album.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveAlbum(idx, 'up')}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                              title="Move album up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === localAlbums.length - 1}
                              onClick={() => handleMoveAlbum(idx, 'down')}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                              title="Move album down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-slate-500 font-bold ml-1">{album.date}</span>
                          </div>

                          <a
                            href={album.albumUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-600 text-emerald-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold border border-emerald-800 transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: ACTION CAROUSEL PHOTOS */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-[#00ADEF]">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white tracking-wide">
                        Action Photo Carousel ({localPhotos.length})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Manage high-resolution match action photos displayed in the hero rotating carousel.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAddingPhoto(!isAddingPhoto);
                      setEditingPhoto(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingPhoto ? 'Cancel' : '+ Add Action Photo'}</span>
                  </button>
                </div>

                {/* Add Photo Form */}
                {isAddingPhoto && (
                  <form onSubmit={handleAddPhotoSubmit} className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1322] border border-blue-600/40 shadow-xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#00ADEF]" />
                        <span>Add New Action Photo to Carousel</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsAddingPhoto(false)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Image Input with Device Upload & URL */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Image URL or Upload *
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://images.unsplash.com/... or direct image link"
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                          />
                        </div>

                        {/* File Upload Helper */}
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-[#00ADEF]" />
                            <span>Upload Image from Device</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setNewPhotoUrl(event.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Photo Metadata */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Photo Title / Headline
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., ECNL Showcase Match Winners"
                            value={newPhotoTitle}
                            onChange={(e) => setNewPhotoTitle(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Subtitle / Match Details
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., High pressing attack and transition play"
                            value={newPhotoSubtitle}
                            onChange={(e) => setNewPhotoSubtitle(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Badge Tag (e.g. Match Highlight, Showcase, Defense)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Match Highlight"
                            value={newPhotoTag}
                            onChange={(e) => setNewPhotoTag(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsAddingPhoto(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow"
                      >
                        Add to Carousel
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit Photo Form */}
                {editingPhoto && (
                  <form onSubmit={handleSaveEditedPhoto} className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1322] border border-blue-500/60 shadow-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-blue-400" />
                        <span>Edit Carousel Photo</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingPhoto(null)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Image URL *
                          </label>
                          <input
                            type="url"
                            required
                            value={editingPhoto.url}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, url: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-[#00ADEF]" />
                            <span>Upload Replacement Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      setEditingPhoto(prev => prev ? { ...prev, url: event.target?.result as string } : null);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Photo Title / Headline
                          </label>
                          <input
                            type="text"
                            value={editingPhoto.title}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Subtitle / Match Details
                          </label>
                          <input
                            type="text"
                            value={editingPhoto.subtitle || ''}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, subtitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Badge Tag
                          </label>
                          <input
                            type="text"
                            value={editingPhoto.tag || ''}
                            onChange={(e) => setEditingPhoto({ ...editingPhoto, tag: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingPhoto(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow"
                      >
                        Save Photo Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {localPhotos.map((photo, index) => (
                    <div 
                      key={photo.id}
                      className="group relative rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-500/60 transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={getSafeImageSrc(photo.url, DEFAULT_ACTION_PHOTOS[0].url)}
                          alt={photo.title}
                          onError={(e) => handleImageError(e, DEFAULT_ACTION_PHOTOS[0].url)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black/70 text-[#00ADEF] border border-blue-500/40">
                          #{index + 1} • {photo.tag || 'Action'}
                        </span>

                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPhoto(photo);
                              setIsAddingPhoto(false);
                            }}
                            className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-600 text-blue-300 hover:text-slate-900 dark:hover:text-white border border-blue-800/80 transition-colors cursor-pointer"
                            title="Edit photo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-slate-900 dark:hover:text-white border border-red-800/80 transition-colors cursor-pointer"
                            title="Delete photo from carousel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-3 space-y-1">
                        <h5 className="font-condensed font-black text-sm text-slate-900 dark:text-white uppercase line-clamp-1">
                          {photo.title}
                        </h5>
                        {photo.subtitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {photo.subtitle}
                          </p>
                        )}
                        <div className="pt-2 text-[10px] text-slate-500 font-bold flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMovePhoto(index, 'up')}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 text-xs"
                              title="Move slide earlier"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === localPhotos.length - 1}
                              onClick={() => handleMovePhoto(index, 'down')}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 text-xs"
                              title="Move slide later"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="ml-1 text-slate-500 dark:text-slate-400">{photo.date || 'Active Slide'}</span>
                          </div>
                          <span className="text-blue-400 font-mono">Slide #{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: INSTAGRAM POST EMBED QUICK LINKS */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-slate-900 dark:text-white">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-condensed font-black text-base uppercase text-slate-900 dark:text-white">
                      Official Team Instagram Account
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Follow <strong>@deanzaforce_2011g_ecnl</strong> for real-time match scores and highlight reels.
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/deanzaforce_2011g_ecnl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-slate-900 dark:text-white font-condensed font-bold text-xs uppercase tracking-wider shadow transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Open Instagram Profile</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: SMART PASTE IMPORTER & BACKUP */}
          {activeTab === 'import_export' && (
            <div className="space-y-6">
              {/* Raw Text Importer */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#10182c] to-[#0a0f1d] border border-blue-900/60 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                    Quick-Paste Roster Text Assistant
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Have a roster list from TeamSnap, SportsEngine, or an email? Simply paste it here (one player per line) and our parser will automatically detect jersey numbers, player names, and positions.
                </p>

                <textarea
                  rows={6}
                  value={rawRosterInput}
                  onChange={(e) => setRawRosterInput(e.target.value)}
                  placeholder="Paste roster lines here, e.g.:&#10;1 Maya Lin GK Mitty 4.25&#10;2 Elena Rostova RB St Francis&#10;7 Kaia Vance FW Cupertino..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleParseRawText}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-md transition-colors"
                  >
                    Parse & Populate Player Squad
                  </button>
                  {importStatus && (
                    <span className="text-xs font-bold text-emerald-400">{importStatus}</span>
                  )}
                </div>
              </div>

              {/* Data Backup & Reset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-condensed font-black text-base uppercase text-slate-900 dark:text-white mb-1">
                      Download Roster CSV Backup
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Export all current players to a CSV spreadsheet you can edit offline.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const headers = ['id', 'firstName', 'lastName', 'jerseyNumber', 'position', 'gradYear', 'gpa', 'highSchool', 'city', 'state', 'email', 'phone', 'imageUrl', 'profileDocUrl', 'hudlUrl', 'commitStatus'];
                      
                      const csvRows = [headers.join(',')];
                      
                      localPlayers.forEach(p => {
                        const values = headers.map(header => {
                          const val = (p as any)[header];
                          if (val === undefined || val === null) return '""';
                          const str = String(val).replace(/"/g, '""');
                          return `"${str}"`;
                        });
                        csvRows.push(values.join(','));
                      });
                      
                      const csvString = csvRows.join('\n');
                      const blob = new Blob([csvString], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'DeAnzaForce_Roster.csv';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold mb-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Backup</span>
                  </button>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Upload Roster CSV:
                    </p>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const text = event.target?.result as string;
                            if (!text) return;
                            
                            // Basic CSV parsing
                            const rows = [];
                            let inQuotes = false;
                            let currentValue = '';
                            let currentRow = [];
                            
                            for (let i = 0; i < text.length; i++) {
                              const char = text[i];
                              if (char === '"') {
                                if (inQuotes && text[i+1] === '"') {
                                  currentValue += '"';
                                  i++;
                                } else {
                                  inQuotes = !inQuotes;
                                }
                              } else if (char === ',' && !inQuotes) {
                                currentRow.push(currentValue);
                                currentValue = '';
                              } else if ((char === '\n' || char === '\r') && !inQuotes) {
                                if (char === '\r' && text[i+1] === '\n') i++;
                                currentRow.push(currentValue);
                                rows.push(currentRow);
                                currentRow = [];
                                currentValue = '';
                              } else {
                                currentValue += char;
                              }
                            }
                            if (currentValue || currentRow.length > 0) {
                              currentRow.push(currentValue);
                              rows.push(currentRow);
                            }
                            
                            if (rows.length < 2) throw new Error("CSV has no data rows");
                            
                            const headers = rows[0].map(h => h.trim());
                            const newPlayers: any[] = [];
                            
                            for (let i = 1; i < rows.length; i++) {
                              const row = rows[i];
                              if (row.length === 1 && (!row[0] || row[0].trim() === '')) continue; // Skip empty rows
                              
                              const p: any = { stats: { appearances: 0, starts: 0, goals: 0, assists: 0, cleanSheets: 0, minutesPlayed: 0 } };
                              let rowHasError = false;
                              
                              headers.forEach((header, index) => {
                                let val = row[index] || '';
                                val = val.trim();
                                if (header === 'jerseyNumber' || header === 'gradYear') {
                                  const parsed = parseInt(val, 10);
                                  p[header] = isNaN(parsed) ? 0 : parsed;
                                } else if (header === 'gpa') {
                                  if (val.toLowerCase() === 'n/a' || val === '') {
                                    p[header] = 'N/A'; // Or handle as string if GPA is string in type
                                  } else {
                                    const parsed = parseFloat(val);
                                    if (isNaN(parsed)) {
                                      throw new Error(`Row ${i + 1} has an invalid GPA: "${val}"`);
                                    }
                                    p[header] = parsed.toFixed(2);
                                  }
                                } else {
                                  p[header] = val;
                                }
                              });
                              
                              if (!p.id) p.id = `p_${Date.now()}_${i}`;
                              newPlayers.push(p);
                            }
                            
                            setLocalPlayers(newPlayers);
                            onSavePlayers(newPlayers); // Auto-save imported players
                            showNotification(`✓ Successfully imported ${newPlayers.length} players from CSV.`);
                          } catch (err: any) {
                            console.error(err);
                            alert(`Failed to parse CSV:\n${err.message || 'Ensure it matches the downloaded format.'}`);
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = ''; // Reset input
                      }}
                      className="text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-condensed font-black text-base uppercase text-slate-900 dark:text-white mb-1">
                      Reset to Official Sample Data
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Restore default De Anza Force players, realistic stats, match fixtures, and NorCal standings.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Current Roster: <strong className="text-slate-900 dark:text-white">{localPlayers.length}</strong> Players
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-slate-900 dark:text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-900/40"
            >
              Save & Apply All
            </button>
          </div>
        </div>

        {/* IN-APP CONFIRMATION MODAL: DELETE PLAYER */}
        {playerPendingDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setPlayerPendingDelete(null);
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
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">Delete Player</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Remove player from team roster</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-slate-900 dark:text-white">#{playerPendingDelete.jerseyNumber} {playerPendingDelete.name}</strong> from the team roster?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPlayerPendingDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeDeletePlayer(playerPendingDelete)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-colors"
                >
                  Yes, Remove Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP CONFIRMATION MODAL: DELETE COACH */}
        {coachPendingDelete && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setCoachPendingDelete(null);
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
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">Delete Staff Member</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Remove coach from staff roster</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{coachPendingDelete.name}</strong> ({coachPendingDelete.role}) from the coaching staff?
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCoachPendingDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeDeleteCoach(coachPendingDelete)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-colors cursor-pointer"
                >
                  Yes, Remove Staff Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IN-APP CONFIRMATION MODAL: RESET DEFAULTS */}
        {showResetConfirm && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setShowResetConfirm(false);
            }}
          >
            <div 
              className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1627] border border-yellow-500/50 p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-yellow-400">
                <div className="p-2.5 rounded-xl bg-yellow-950/80 border border-yellow-500/30 text-yellow-400">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">Reset to Official Defaults</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Restore default team roster & schedule</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This will restore the original De Anza Force official ECNL roster and schedule fixtures.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetToDefaults();
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white text-xs font-bold shadow-lg transition-colors"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};
