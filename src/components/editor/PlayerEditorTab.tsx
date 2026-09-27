import React, { useState, useMemo } from 'react';
import type { Player, PositionCategory } from '../../types';
import { 
  compressHeadshot, 
  getSafeImageSrc, 
  handleImageError, 
  DEFAULT_PLAYER_PHOTO, 
  CLUB_LOGO_URL, 
  IMGUR_HEADSHOTS 
} from '../../utils/imageUtils';
import { uploadPlayerHeadshot, uploadPlayerScoutPdf } from '../../utils/cloudStorage';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Star, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Camera, 
  Mail, 
  GraduationCap,
  FileSpreadsheet,
  FileText,
  FileUp,
  Loader2
} from 'lucide-react';

interface PlayerEditorTabProps {
  players: Player[];
  onSavePlayers: (players: Player[]) => void;
  showNotification: (msg: string) => void;
  initialEditingPlayer?: Player | null;
  onOpenSyncTab?: () => void;
}

type RosterSortField = 'jerseyNumber' | 'name' | 'position' | 'ageGroup' | 'gradYear' | 'gpa' | 'commitment';

export const PlayerEditorTab: React.FC<PlayerEditorTabProps> = ({
  players,
  onSavePlayers,
  showNotification,
  initialEditingPlayer,
  onOpenSyncTab,
}) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(initialEditingPlayer || null);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [playerPendingDelete, setPlayerPendingDelete] = useState<Player | null>(null);

  // Sorting & Filtering
  const [sortField, setSortField] = useState<RosterSortField>('jerseyNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Draft string inputs for numbers so typing/backspacing doesn't snap to 0
  const [draftJersey, setDraftJersey] = useState<string>('');
  const [draftGradYear, setDraftGradYear] = useState<string>('');
  const [draftBirthYear, setDraftBirthYear] = useState<string>('');
  const [draftAppearances, setDraftAppearances] = useState<string>('');
  const [draftStarts, setDraftStarts] = useState<string>('');
  const [draftGoals, setDraftGoals] = useState<string>('');
  const [draftAssists, setDraftAssists] = useState<string>('');
  const [draftCleanSheets, setDraftCleanSheets] = useState<string>('');
  const [draftSaves, setDraftSaves] = useState<string>('');
  const [draftMinutes, setDraftMinutes] = useState<string>('');
  const [newAwardInput, setNewAwardInput] = useState('');

  // Cloud upload states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const startEditing = (player: Player) => {
    setEditingPlayer({ ...player });
    setIsCreatingPlayer(false);
    setDraftJersey(player.jerseyNumber !== undefined ? String(player.jerseyNumber) : '');
    setDraftGradYear(player.gradYear ? String(player.gradYear) : '2028');
    setDraftBirthYear(player.birthYear ? String(player.birthYear) : '2010');
    setDraftAppearances(String(player.stats?.appearances ?? 0));
    setDraftStarts(String(player.stats?.starts ?? 0));
    setDraftGoals(String(player.stats?.goals ?? 0));
    setDraftAssists(String(player.stats?.assists ?? 0));
    setDraftCleanSheets(String(player.stats?.cleanSheets ?? 0));
    setDraftSaves(String(player.stats?.saves ?? 0));
    setDraftMinutes(String(player.stats?.minutesPlayed ?? 0));
    setNewAwardInput('');
  };

  const startCreating = () => {
    const nextJersey = players.length > 0 ? Math.max(...players.map(p => p.jerseyNumber || 0)) + 1 : 1;
    const newP: Player = {
      id: `p_${Date.now()}`,
      name: '',
      jerseyNumber: nextJersey,
      primaryPosition: 'Midfielder',
      specificPosition: 'Central Midfielder (CM)',
      secondaryPositions: ['Attacking Midfielder'],
      gradYear: 2029,
      birthYear: 2010,
      birthday: '',
      height: '5\'5"',
      weight: '120 lbs',
      dominantFoot: 'Right',
      highSchool: 'Bay Area High School',
      gpa: '4.00',
      photoUrl: DEFAULT_PLAYER_PHOTO,
      bio: '',
      commitment: 'Uncommitted',
      awards: ['ECNL NorCal Candidate'],
      stats: {
        appearances: 0,
        starts: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        saves: 0,
        minutesPlayed: 0,
      },
    };
    setEditingPlayer(newP);
    setIsCreatingPlayer(true);
    setDraftJersey(String(nextJersey));
    setDraftGradYear('2029');
    setDraftBirthYear('2010');
    setDraftAppearances('0');
    setDraftStarts('0');
    setDraftGoals('0');
    setDraftAssists('0');
    setDraftCleanSheets('0');
    setDraftSaves('0');
    setDraftMinutes('0');
    setNewAwardInput('');
  };

  const cancelEditing = () => {
    setEditingPlayer(null);
    setIsCreatingPlayer(false);
  };

  const handleSortToggle = (field: RosterSortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredAndSortedPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = players.filter(player => {
      if (!q) return true;
      const matchesName = (player.name || '').toLowerCase().includes(q);
      const matchesJersey = (player.jerseyNumber ?? '').toString().includes(q);
      const matchesPosition = (player.specificPosition || '').toLowerCase().includes(q) || (player.primaryPosition || '').toLowerCase().includes(q);
      const matchesSchool = (player.highSchool || '').toLowerCase().includes(q);
      const matchesCommitment = (player.commitment || '').toLowerCase().includes(q);
      return matchesName || matchesJersey || matchesPosition || matchesSchool || matchesCommitment;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
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
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [players, sortField, sortDir, searchQuery]);

  const handleSavePlayerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    const parsedJersey = parseInt(draftJersey, 10);
    const parsedGradYear = parseInt(draftGradYear, 10);
    const parsedBirthYear = parseInt(draftBirthYear, 10);

    const finalizedPlayer: Player = {
      ...editingPlayer,
      jerseyNumber: isNaN(parsedJersey) ? 0 : parsedJersey,
      gradYear: isNaN(parsedGradYear) ? 2028 : parsedGradYear,
      birthYear: isNaN(parsedBirthYear) ? undefined : parsedBirthYear,
      stats: {
        ...editingPlayer.stats,
        appearances: parseInt(draftAppearances, 10) || 0,
        starts: parseInt(draftStarts, 10) || 0,
        goals: parseInt(draftGoals, 10) || 0,
        assists: parseInt(draftAssists, 10) || 0,
        cleanSheets: parseInt(draftCleanSheets, 10) || 0,
        saves: parseInt(draftSaves, 10) || 0,
        minutesPlayed: parseInt(draftMinutes, 10) || 0,
      }
    };

    let updated: Player[];
    if (isCreatingPlayer) {
      updated = [...players, finalizedPlayer];
      showNotification(`✓ Added #${finalizedPlayer.jerseyNumber} ${finalizedPlayer.name} to the roster!`);
    } else {
      updated = players.map(p => (p.id === finalizedPlayer.id ? finalizedPlayer : p));
      showNotification(`✓ Saved changes for #${finalizedPlayer.jerseyNumber} ${finalizedPlayer.name}!`);
    }

    onSavePlayers(updated);
    setEditingPlayer(null);
    setIsCreatingPlayer(false);
  };

  const executeDeletePlayer = (targetPlayer: Player) => {
    const updated = players.filter(p => p.id !== targetPlayer.id);
    onSavePlayers(updated);
    if (editingPlayer?.id === targetPlayer.id) {
      setEditingPlayer(null);
    }
    setPlayerPendingDelete(null);
    showNotification(`✓ Removed #${targetPlayer.jerseyNumber} ${targetPlayer.name} from the roster.`);
  };

  const handleQuickPhotoUpload = (player: Player, file: File) => {
    compressHeadshot(file)
      .then(compressed => {
        const updated = players.map(p => (p.id === player.id ? { ...p, photoUrl: compressed } : p));
        onSavePlayers(updated);
        showNotification(`✓ Photo updated for #${player.jerseyNumber} ${player.name}!`);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to process image file.');
      });
  };

  return (
    <div className="space-y-6">
      {/* Sub-form: Create or Edit Player */}
      {editingPlayer ? (
        <form onSubmit={handleSavePlayerForm} className="space-y-4 bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-blue-900/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
              {isCreatingPlayer ? 'Add New Player to Roster' : `Edit Profile: ${editingPlayer.name} (#${draftJersey || editingPlayer.jerseyNumber})`}
            </h3>
            <button
              type="button"
              onClick={cancelEditing}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Captain Toggle */}
            <div className="sm:col-span-2 md:col-span-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-amber-500/40 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer text-slate-700 dark:text-slate-200 font-bold text-xs select-none">
                <input
                  type="checkbox"
                  checked={!!editingPlayer.isCaptain}
                  onChange={e => setEditingPlayer({ ...editingPlayer, isCaptain: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-amber-500 cursor-pointer"
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

            {/* Basic Info */}
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Full Player Name</label>
              <input
                type="text"
                required
                value={editingPlayer.name}
                onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Jersey Number</label>
              <input
                type="text"
                required
                value={draftJersey}
                onChange={e => setDraftJersey(e.target.value)}
                placeholder="e.g. 10"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Primary Position Category</label>
              <select
                value={editingPlayer.primaryPosition}
                onChange={e => setEditingPlayer({ ...editingPlayer, primaryPosition: e.target.value as PositionCategory })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              >
                <option value="Forward">Forward</option>
                <option value="Midfielder">Midfielder</option>
                <option value="Defender">Defender</option>
                <option value="Goalkeeper">Goalkeeper</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Specific Position Tag</label>
              <input
                type="text"
                value={editingPlayer.specificPosition}
                onChange={e => setEditingPlayer({ ...editingPlayer, specificPosition: e.target.value })}
                placeholder="e.g. Center Forward (#9)"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Graduation Year</label>
              <input
                type="text"
                value={draftGradYear}
                onChange={e => setDraftGradYear(e.target.value)}
                placeholder="2028 or 2029"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Birth Year & Birthday</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftBirthYear}
                  onChange={e => setDraftBirthYear(e.target.value)}
                  placeholder="2010"
                  className="w-20 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
                <input
                  type="text"
                  value={editingPlayer.birthday || ''}
                  onChange={e => setEditingPlayer({ ...editingPlayer, birthday: e.target.value })}
                  placeholder="MM/DD/YYYY"
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Height & Weight</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPlayer.height}
                  onChange={e => setEditingPlayer({ ...editingPlayer, height: e.target.value })}
                  placeholder={"5'7\""}
                  className="w-1/2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
                <input
                  type="text"
                  value={editingPlayer.weight || ''}
                  onChange={e => setEditingPlayer({ ...editingPlayer, weight: e.target.value })}
                  placeholder="125 lbs"
                  className="w-1/2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Dominant Foot</label>
              <select
                value={editingPlayer.dominantFoot}
                onChange={e => setEditingPlayer({ ...editingPlayer, dominantFoot: e.target.value as 'Right' | 'Left' | 'Both' })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              >
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both Feet</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">High School & GPA</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingPlayer.highSchool}
                  onChange={e => setEditingPlayer({ ...editingPlayer, highSchool: e.target.value })}
                  placeholder="High School"
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
                <input
                  type="text"
                  value={editingPlayer.gpa}
                  onChange={e => setEditingPlayer({ ...editingPlayer, gpa: e.target.value })}
                  placeholder="4.00"
                  className="w-20 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>

            {/* College Recruitment & Socials */}
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">College Commitment</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer({ ...editingPlayer, commitment: editingPlayer.commitment === 'Uncommitted' ? '' : 'Uncommitted' })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    editingPlayer.commitment === 'Uncommitted'
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Uncommitted
                </button>
                <input
                  type="text"
                  value={editingPlayer.commitment}
                  onChange={e => setEditingPlayer({ ...editingPlayer, commitment: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">NCAA Eligibility ID</label>
              <input
                type="text"
                value={editingPlayer.ncaaId || ''}
                onChange={e => setEditingPlayer({ ...editingPlayer, ncaaId: e.target.value })}
                placeholder="e.g. 2405987123"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Contact Email</label>
              <input
                type="email"
                value={editingPlayer.contactEmail || ''}
                onChange={e => setEditingPlayer({ ...editingPlayer, contactEmail: e.target.value })}
                placeholder="player@email.com"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Highlights URL (YouTube / Hudl / Veo)</label>
              <input
                type="url"
                value={editingPlayer.highlightsUrl || ''}
                onChange={e => setEditingPlayer({ ...editingPlayer, highlightsUrl: e.target.value })}
                placeholder="https://hudl.com/..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Instagram Handle</label>
              <input
                type="text"
                value={editingPlayer.instagram || ''}
                onChange={e => setEditingPlayer({ ...editingPlayer, instagram: e.target.value })}
                placeholder="@username"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Player Profile PDF Flyer Document</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingPlayer.profileDocUrl || ''}
                  onChange={e => setEditingPlayer({ ...editingPlayer, profileDocUrl: e.target.value, profilePdfUrl: e.target.value })}
                  placeholder="Eliot Kline Player Profile.pdf or https://..."
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 font-mono text-xs"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                  {isUploadingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                      <span>{pdfProgress}%</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-3.5 h-3.5 text-blue-500" />
                      <span>Upload PDF</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    disabled={isUploadingPdf}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingPdf(true);
                      setPdfProgress(10);
                      const res = await uploadPlayerScoutPdf(file, p => setPdfProgress(p));
                      setIsUploadingPdf(false);
                      setEditingPlayer({
                        ...editingPlayer,
                        profileDocUrl: res.url,
                        profilePdfUrl: res.url,
                      });
                      showNotification(`✓ Attached PDF flyer: ${file.name}`);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Photo URL & Upload */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Headshot Photo & Cloud Upload</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editingPlayer.photoUrl}
                  onChange={e => setEditingPlayer({ ...editingPlayer, photoUrl: e.target.value })}
                  placeholder="https://... or upload image"
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 font-mono text-[11px]"
                />
                <label className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs border border-blue-500/30 flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>{photoProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingPhoto(true);
                      setPhotoProgress(10);
                      const res = await uploadPlayerHeadshot(editingPlayer.id, file, p => setPhotoProgress(p));
                      setIsUploadingPhoto(false);
                      setEditingPlayer({ ...editingPlayer, photoUrl: res.url });
                      showNotification(`✓ Uploaded player headshot: ${file.name}`);
                    }}
                  />
                </label>
                <img
                  src={getSafeImageSrc(editingPlayer.photoUrl, DEFAULT_PLAYER_PHOTO)}
                  alt={editingPlayer.name || 'Preview'}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shrink-0"
                  onError={e => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                />
              </div>

              {/* Verified Album Headshot Quick Selectors */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                <span>Imgur Headshots:</span>
                {Object.entries(IMGUR_HEADSHOTS).slice(0, 10).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditingPlayer({ ...editingPlayer, photoUrl: item.url })}
                    className="underline hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {item.firstName}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Scouting Bio & Playing Style</label>
              <textarea
                rows={3}
                value={editingPlayer.bio || ''}
                onChange={e => setEditingPlayer({ ...editingPlayer, bio: e.target.value })}
                placeholder="High work-rate central playmaker with sharp technical passing, high engine, and tenacious ball-winning..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            {/* Season Stats Inputs */}
            <div className="sm:col-span-2 md:col-span-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <h4 className="font-condensed font-black text-sm uppercase text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span>Verified Matchday Season Statistics</span>
                <span className="text-[10px] font-normal text-slate-500">(Displayed in player modal and printable college packet)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Appearances</label>
                  <input
                    type="text"
                    value={draftAppearances}
                    onChange={e => setDraftAppearances(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Starts</label>
                  <input
                    type="text"
                    value={draftStarts}
                    onChange={e => setDraftStarts(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Goals</label>
                  <input
                    type="text"
                    value={draftGoals}
                    onChange={e => setDraftGoals(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Assists</label>
                  <input
                    type="text"
                    value={draftAssists}
                    onChange={e => setDraftAssists(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Clean Sheets</label>
                  <input
                    type="text"
                    value={draftCleanSheets}
                    onChange={e => setDraftCleanSheets(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Saves</label>
                  <input
                    type="text"
                    value={draftSaves}
                    onChange={e => setDraftSaves(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Minutes</label>
                  <input
                    type="text"
                    value={draftMinutes}
                    onChange={e => setDraftMinutes(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Awards & Honors */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Awards & Honors</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAwardInput}
                  onChange={e => setNewAwardInput(e.target.value)}
                  placeholder="e.g. ECNL NorCal Candidate, All-League 1st Team"
                  className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newAwardInput.trim()) {
                        setEditingPlayer({
                          ...editingPlayer,
                          awards: [...(editingPlayer.awards || []), newAwardInput.trim()]
                        });
                        setNewAwardInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newAwardInput.trim()) {
                      setEditingPlayer({
                        ...editingPlayer,
                        awards: [...(editingPlayer.awards || []), newAwardInput.trim()]
                      });
                      setNewAwardInput('');
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
                >
                  Add Award
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(editingPlayer.awards || []).map((award, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                  >
                    <span>{award}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlayer({
                          ...editingPlayer,
                          awards: editingPlayer.awards.filter((_, i) => i !== idx)
                        });
                      }}
                      className="text-slate-400 hover:text-red-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            {!isCreatingPlayer && editingPlayer ? (
              <button
                type="button"
                onClick={() => setPlayerPendingDelete(editingPlayer)}
                className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Player</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-md shadow-blue-900/30 cursor-pointer"
              >
                {isCreatingPlayer ? 'Add Player to Squad' : 'Save Player Profile'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Roster Table View */
        <>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span>Team Roster ({players.length} Players)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any player row to edit stats, high school info, GPAs, photos, or recruiting flyer links.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenSyncTab && (
                <button
                  type="button"
                  onClick={onOpenSyncTab}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                  title="Sync roster from CSV or Google Sheets"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                  <span>Sync Spreadsheet</span>
                </button>
              )}

              <button
                type="button"
                onClick={startCreating}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Player</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by player name, jersey #, position, high school, or commitment..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-[11px] font-bold">Sort by:</span>
              {(['jerseyNumber', 'name', 'position', 'gradYear', 'gpa'] as RosterSortField[]).map(field => (
                <button
                  key={field}
                  type="button"
                  onClick={() => handleSortToggle(field)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    sortField === field
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="capitalize">{field.replace('jerseyNumber', 'Jersey #').replace('gradYear', 'Grad Year')}</span>
                  {sortField === field && (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Player Cards / List */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredAndSortedPlayers.map(player => (
              <div
                key={player.id}
                className="p-3 bg-white dark:bg-slate-900/80 hover:bg-blue-50/50 dark:hover:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative group shrink-0">
                    <img
                      src={getSafeImageSrc(player.photoUrl, DEFAULT_PLAYER_PHOTO)}
                      alt={player.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                      onError={e => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                    />
                    <label 
                      className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Quick photo upload"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleQuickPhotoUpload(player, file);
                        }}
                      />
                    </label>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-condensed font-black text-sm text-[#00ADEF]">
                        #{player.jerseyNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {player.name}
                      </h4>
                      {player.isCaptain && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          Capt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {player.specificPosition || player.primaryPosition}
                      </span>
                      <span>•</span>
                      <span>Grad '{player.gradYear}'</span>
                      {player.gpa && (
                        <>
                          <span>•</span>
                          <span>GPA {player.gpa}</span>
                        </>
                      )}
                      {player.commitment && (
                        <>
                          <span>•</span>
                          <span className={player.commitment === 'Uncommitted' ? 'text-amber-500' : 'text-emerald-400 font-bold'}>
                            {player.commitment}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditing(player)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Edit Player"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerPendingDelete(player)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Delete Player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal: Delete Player */}
      {playerPendingDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayerPendingDelete(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1627] border border-red-500/50 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
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
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlayerPendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeletePlayer(playerPendingDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
