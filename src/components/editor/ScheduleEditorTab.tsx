import React, { useState, useMemo } from 'react';
import type { Match, MatchCompetition, MatchStatus } from '../../types';
import { computeRecordAndFormFromMatches } from '../../utils/recordUtils';
import { 
  Plus, 
  Trash2, 
  Zap, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  Save,
  FileSpreadsheet
} from 'lucide-react';

interface ScheduleEditorTabProps {
  matches: Match[];
  onSaveMatches: (matches: Match[]) => void;
  showNotification: (msg: string) => void;
  onAutoSyncRecordAndForm?: () => void;
  onOpenSyncTab?: () => void;
}

export const ScheduleEditorTab: React.FC<ScheduleEditorTabProps> = ({
  matches,
  onSaveMatches,
  showNotification,
  onAutoSyncRecordAndForm,
  onOpenSyncTab,
}) => {
  // Local working copy for editing
  const [localMatches, setLocalMatches] = useState<Match[]>(matches);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Keep in sync when props change from outside
  React.useEffect(() => {
    setLocalMatches(matches);
    setHasUnsavedChanges(false);
  }, [matches]);

  const computedMatchRecord = useMemo(() => {
    return computeRecordAndFormFromMatches(localMatches);
  }, [localMatches]);

  const handleUpdateMatchField = <K extends keyof Match>(index: number, field: K, value: Match[K]) => {
    setLocalMatches(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const handleAddMatch = () => {
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
    const updated = [newMatch, ...localMatches];
    setLocalMatches(updated);
    setHasUnsavedChanges(true);
    showNotification('Added new match fixture. Remember to click "Save Schedule".');
  };

  const handleDeleteMatch = (index: number) => {
    const updated = localMatches.filter((_, i) => i !== index);
    setLocalMatches(updated);
    setHasUnsavedChanges(true);
    showNotification('Removed match fixture.');
  };

  const handleSaveAllMatches = () => {
    onSaveMatches(localMatches);
    setHasUnsavedChanges(false);
    showNotification('✓ Match schedule saved to database successfully!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
            Match Fixtures & Schedule Details ({localMatches.length} Matches)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Edit complete kickoff times, venues, field numbers, map addresses, home/away status, and scores.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onAutoSyncRecordAndForm && (
            <button
              type="button"
              onClick={onAutoSyncRecordAndForm}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs border border-blue-500/40 transition-colors cursor-pointer shrink-0"
              title="Auto-sync standings table and season record from completed match scores"
            >
              <Zap className="w-3.5 h-3.5 text-[#00ADEF]" />
              <span>Auto-Sync Record</span>
            </button>
          )}

          {onOpenSyncTab && (
            <button
              type="button"
              onClick={onOpenSyncTab}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer shrink-0 transition-colors"
              title="Sync schedule from CSV or Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
              <span>Sync Spreadsheet</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddMatch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shrink-0 shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Match</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllMatches}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0 shadow-lg transition-all ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400 animate-pulse'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Automated Record & Form Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-[#00ADEF] border border-blue-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Live Record From Fixtures
            </span>
            <span className="text-slate-400">Auto-calculated from completed match fixtures</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-condensed font-black text-sm text-slate-900 dark:text-white">
              <span>Record:</span>
              <span className="text-emerald-400">{computedMatchRecord.wins}W</span>
              <span className="text-slate-500">-</span>
              <span className="text-red-400">{computedMatchRecord.losses}L</span>
              <span className="text-slate-500">-</span>
              <span className="text-amber-400">{computedMatchRecord.draws}D</span>
              <span className="text-slate-400 font-normal">({computedMatchRecord.points} pts, {computedMatchRecord.played} GP)</span>
            </div>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold">Form:</span>
              <div className="flex items-center gap-1">
                {computedMatchRecord.form.map((f, i) => (
                  <span 
                    key={i} 
                    className={`w-5 h-5 rounded flex items-center justify-center font-black text-[10px] ${
                      f === 'W' ? 'bg-emerald-600 text-white' :
                      f === 'L' ? 'bg-red-600 text-white' :
                      f === 'D' ? 'bg-amber-600 text-white' :
                      'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {localMatches.map((m, index) => (
          <div
            key={m.id || index}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-condensed font-bold text-sm text-slate-900 dark:text-white">
                  Match #{localMatches.length - index}: {m.opponent}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  m.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  m.status === 'live' ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' :
                  'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {m.status}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  m.isHome ? 'bg-blue-950/80 text-blue-300' : 'bg-amber-950/80 text-amber-300'
                }`}>
                  {m.isHome ? 'HOME' : 'AWAY'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteMatch(index)}
                className="px-2.5 py-1 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-600 hover:text-white border border-red-800/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Date */}
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  Match Date
                </label>
                <input
                  type="date"
                  value={m.date}
                  onChange={e => handleUpdateMatchField(index, 'date', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>

              {/* Time */}
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  Kickoff Time
                </label>
                <input
                  type="text"
                  value={m.time}
                  placeholder="e.g. 11:00 AM PST"
                  onChange={e => handleUpdateMatchField(index, 'time', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>

              {/* Opponent */}
              <div className="sm:col-span-1 lg:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  Opponent Name
                </label>
                <input
                  type="text"
                  value={m.opponent}
                  onChange={e => handleUpdateMatchField(index, 'opponent', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 font-bold"
                />
              </div>

              {/* Home/Away Toggle */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Venue Type
                </label>
                <select
                  value={m.isHome ? 'home' : 'away'}
                  onChange={e => handleUpdateMatchField(index, 'isHome', e.target.value === 'home')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 font-bold"
                >
                  <option value="home">Home (vs)</option>
                  <option value="away">Away (at)</option>
                </select>
              </div>

              {/* Competition */}
              <div className="sm:col-span-1 lg:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Competition
                </label>
                <select
                  value={m.competition}
                  onChange={e => handleUpdateMatchField(index, 'competition', e.target.value as MatchCompetition)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                >
                  <option value="ECNL Northern California">ECNL Northern California</option>
                  <option value="Surf Cup">Surf Cup</option>
                  <option value="ECNL National Showcase">ECNL National Showcase</option>
                  <option value="SilverLakes Showcase">SilverLakes Showcase</option>
                  <option value="NorCal State Cup">NorCal State Cup</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>

              {/* Status */}
              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Match Status
                </label>
                <select
                  value={m.status}
                  onChange={e => handleUpdateMatchField(index, 'status', e.target.value as MatchStatus)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500 font-bold"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live Now</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Force Score */}
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  De Anza Force Score
                </label>
                <input
                  type="text"
                  value={m.teamScore !== undefined ? String(m.teamScore) : ''}
                  placeholder="Goals"
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : (parseInt(e.target.value, 10) || 0);
                    handleUpdateMatchField(index, 'teamScore', val);
                  }}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                />
              </div>

              {/* Opponent Score */}
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Opponent Score
                </label>
                <input
                  type="text"
                  value={m.opponentScore !== undefined ? String(m.opponentScore) : ''}
                  placeholder="Goals"
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : (parseInt(e.target.value, 10) || 0);
                    handleUpdateMatchField(index, 'opponentScore', val);
                  }}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center font-bold"
                />
              </div>

              {/* Venue & Field */}
              <div className="sm:col-span-1 lg:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  Facility / Venue Name
                </label>
                <input
                  type="text"
                  value={m.venue}
                  onChange={e => handleUpdateMatchField(index, 'venue', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Field # / Turf
                </label>
                <input
                  type="text"
                  value={m.fieldNumber || ''}
                  placeholder="e.g. Field #3"
                  onChange={e => handleUpdateMatchField(index, 'fieldNumber', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-1 lg:col-span-6">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Full Street Address (GPS)
                </label>
                <input
                  type="text"
                  value={m.address}
                  onChange={e => handleUpdateMatchField(index, 'address', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>

              {/* Video Livestream */}
              <div className="sm:col-span-2 lg:col-span-6">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1">
                  <Video className="w-3 h-3 text-[#00ADEF]" />
                  Video Livestream URL (Veo / YouTube / Hudl)
                </label>
                <input
                  type="url"
                  value={m.videoLiveStreamUrl || ''}
                  placeholder="https://app.veo.co/matches/..."
                  onChange={e => handleUpdateMatchField(index, 'videoLiveStreamUrl', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 lg:col-span-6">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Match Notes / Goal Scorers
                </label>
                <input
                  type="text"
                  value={m.gameNotes || ''}
                  placeholder="e.g. Scored by #9, #10. NorCal Showcase match."
                  onChange={e => handleUpdateMatchField(index, 'gameNotes', e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
