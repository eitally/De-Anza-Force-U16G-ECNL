import React, { useState, useEffect } from 'react';
import type { Player, Match, TeamInfo } from '../../types';
import {
  parseRosterCSV,
  parseScheduleCSV,
  normalizeGoogleSheetUrl,
  type PlayerDiffRecord,
} from '../../utils/csvSync';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Link2,
  Sparkles,
  RotateCcw,
  Check,
  AlertCircle,
  ArrowRight,
  Calendar,
  Users,
  Save,
} from 'lucide-react';

interface ImportExportTabProps {
  players: Player[];
  matches?: Match[];
  teamInfo?: TeamInfo;
  onSavePlayers: (players: Player[]) => void;
  onSaveMatches?: (matches: Match[]) => void;
  onSaveTeamInfo?: (info: TeamInfo) => void;
  onResetToDefaults: () => void;
  showNotification: (msg: string) => void;
}

export const ImportExportTab: React.FC<ImportExportTabProps> = ({
  players,
  matches = [],
  teamInfo,
  onSavePlayers,
  onSaveMatches,
  onSaveTeamInfo,
  onResetToDefaults,
  showNotification,
}) => {
  // Active sub-section
  const [activeSection, setActiveSection] = useState<'roster' | 'schedule' | 'quickpaste' | 'backup'>('roster');

  // Roster sync state
  const [rosterSyncMode, setRosterSyncMode] = useState<'merge' | 'replace'>('merge');
  const [rosterGoogleSheetUrl, setRosterGoogleSheetUrl] = useState(teamInfo?.rosterGoogleSheetUrl || '');
  const [isLoadingRosterUrl, setIsLoadingRosterUrl] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'diffs' | 'table'>('diffs');
  const [rosterPreview, setRosterPreview] = useState<{
    players: Player[];
    matchedCount: number;
    newCount: number;
    updatedWithChangesCount: number;
    diffs: PlayerDiffRecord[];
    columnsFound: string[];
    errors: string[];
  } | null>(null);

  // Schedule sync state
  const [scheduleGoogleSheetUrl, setScheduleGoogleSheetUrl] = useState(teamInfo?.scheduleGoogleSheetUrl || '');
  const [isLoadingScheduleUrl, setIsLoadingScheduleUrl] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [schedulePreview, setSchedulePreview] = useState<{
    matches: Match[];
    newCount: number;
    errors: string[];
  } | null>(null);

  // Quick-paste state
  const [rawRosterInput, setRawRosterInput] = useState('');
  const [quickPasteStatus, setQuickPasteStatus] = useState<string | null>(null);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (teamInfo?.rosterGoogleSheetUrl && !rosterGoogleSheetUrl) {
      setRosterGoogleSheetUrl(teamInfo.rosterGoogleSheetUrl);
    }
    if (teamInfo?.scheduleGoogleSheetUrl && !scheduleGoogleSheetUrl) {
      setScheduleGoogleSheetUrl(teamInfo.scheduleGoogleSheetUrl);
    }
  }, [teamInfo?.rosterGoogleSheetUrl, teamInfo?.scheduleGoogleSheetUrl]);

  // ---------------------------------------------
  // ROSTER SYNC HANDLERS
  // ---------------------------------------------
  const handleSaveRosterSheetUrl = () => {
    if (!teamInfo || !onSaveTeamInfo) return;
    onSaveTeamInfo({
      ...teamInfo,
      rosterGoogleSheetUrl: rosterGoogleSheetUrl.trim(),
    });
    showNotification('Saved Roster Google Sheet URL to team settings.');
  };

  const handleRosterFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRosterError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (!text) return;
      processRosterCSVText(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFetchRosterGoogleSheet = async () => {
    if (!rosterGoogleSheetUrl.trim()) return;
    setIsLoadingRosterUrl(true);
    setRosterError(null);

    if (teamInfo && onSaveTeamInfo && rosterGoogleSheetUrl.trim() !== teamInfo.rosterGoogleSheetUrl) {
      onSaveTeamInfo({
        ...teamInfo,
        rosterGoogleSheetUrl: rosterGoogleSheetUrl.trim(),
      });
    }

    try {
      const exportUrl = normalizeGoogleSheetUrl(rosterGoogleSheetUrl);
      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch sheet (HTTP ${res.status}). Make sure the Google Sheet is shared as "Anyone with the link can view".`
        );
      }
      const text = await res.text();
      processRosterCSVText(text);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Could not load sheet. Ensure it is publicly viewable.';
      setRosterError(msg);
      showNotification(`Sheet fetch error: ${msg}`);
    } finally {
      setIsLoadingRosterUrl(false);
    }
  };

  const processRosterCSVText = (csvText: string) => {
    setRosterError(null);
    const parsed = parseRosterCSV(csvText, players, rosterSyncMode);
    if (parsed.errors.length > 0 && parsed.players.length === 0) {
      const errMsg = parsed.errors.join(' | ');
      setRosterError(errMsg);
      showNotification(`CSV Parsing Error: ${errMsg}`);
      return;
    }
    setPreviewTab(parsed.updatedWithChangesCount > 0 || parsed.newCount > 0 ? 'diffs' : 'table');
    setRosterPreview({
      players: parsed.players,
      matchedCount: parsed.matchedCount,
      newCount: parsed.newCount,
      updatedWithChangesCount: parsed.updatedWithChangesCount,
      diffs: parsed.diffs,
      columnsFound: parsed.columnsFound,
      errors: parsed.errors,
    });
  };

  const handleApplyRosterSync = () => {
    if (!rosterPreview) return;
    onSavePlayers(rosterPreview.players);
    showNotification(
      `Applied roster update: ${rosterPreview.updatedWithChangesCount} modified, ${rosterPreview.newCount} added.`
    );
    setRosterPreview(null);
  };

  const handleDownloadRosterCSV = () => {
    const headers = [
      'jerseyNumber',
      'name',
      'primaryPosition',
      'specificPosition',
      'gradYear',
      'birthYear',
      'birthday',
      'gpa',
      'highSchool',
      'height',
      'weight',
      'dominantFoot',
      'commitment',
      'contactEmail',
      'highlightsUrl',
      'profileDocUrl',
      'ncaaId',
      'instagram',
    ];

    const rows = [headers.join(',')];
    players.forEach(p => {
      const vals = headers.map(h => {
        const v = (p as any)[h];
        if (v === undefined || v === null) return '""';
        return `"${String(v).replace(/"/g, '""')}"`;
      });
      rows.push(vals.join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeAnzaForce_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Downloaded current roster CSV.');
  };

  // ---------------------------------------------
  // SCHEDULE SYNC HANDLERS
  // ---------------------------------------------
  const handleScheduleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScheduleError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (!text) return;
      processScheduleCSVText(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleFetchScheduleGoogleSheet = async () => {
    if (!scheduleGoogleSheetUrl.trim()) return;
    setIsLoadingScheduleUrl(true);
    setScheduleError(null);

    if (teamInfo && onSaveTeamInfo && scheduleGoogleSheetUrl.trim() !== teamInfo.scheduleGoogleSheetUrl) {
      onSaveTeamInfo({
        ...teamInfo,
        scheduleGoogleSheetUrl: scheduleGoogleSheetUrl.trim(),
      });
    }

    try {
      const exportUrl = normalizeGoogleSheetUrl(scheduleGoogleSheetUrl);
      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error(
          `Failed to fetch sheet (HTTP ${res.status}). Make sure the Google Sheet is shared as "Anyone with the link can view".`
        );
      }
      const text = await res.text();
      processScheduleCSVText(text);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Could not load schedule sheet.';
      setScheduleError(msg);
      showNotification(`Schedule sheet error: ${msg}`);
    } finally {
      setIsLoadingScheduleUrl(false);
    }
  };

  const processScheduleCSVText = (csvText: string) => {
    setScheduleError(null);
    const parsed = parseScheduleCSV(csvText);
    if (parsed.errors.length > 0 && parsed.matches.length === 0) {
      const errMsg = parsed.errors.join(' | ');
      setScheduleError(errMsg);
      showNotification(`Schedule CSV Error: ${errMsg}`);
      return;
    }
    setSchedulePreview({
      matches: parsed.matches,
      newCount: parsed.newCount,
      errors: parsed.errors,
    });
  };

  const handleApplyScheduleSync = () => {
    if (!schedulePreview || !onSaveMatches) return;
    onSaveMatches(schedulePreview.matches);
    showNotification(`Applied schedule update: ${schedulePreview.matches.length} matches saved.`);
    setSchedulePreview(null);
  };

  const handleDownloadScheduleCSV = () => {
    const headers = [
      'date',
      'time',
      'opponent',
      'homeAway',
      'competition',
      'venue',
      'fieldNumber',
      'address',
      'status',
      'teamScore',
      'opponentScore',
      'videoLiveStreamUrl',
      'gameNotes',
    ];

    const rows = [headers.join(',')];
    matches.forEach(m => {
      const vals = [
        m.date,
        m.time,
        m.opponent,
        m.isHome ? 'Home' : 'Away',
        m.competition,
        m.venue,
        m.fieldNumber || '',
        m.address,
        m.status,
        m.teamScore !== undefined ? String(m.teamScore) : '',
        m.opponentScore !== undefined ? String(m.opponentScore) : '',
        m.videoLiveStreamUrl || '',
        m.gameNotes || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      rows.push(vals.join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeAnzaForce_Schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Downloaded current schedule CSV.');
  };

  // ---------------------------------------------
  // QUICK PASTE HANDLER
  // ---------------------------------------------
  const handleParseRawText = () => {
    if (!rawRosterInput.trim()) return;
    const parsed = parseRosterCSV(rawRosterInput, players, 'merge');
    if (parsed.players.length > 0) {
      onSavePlayers(parsed.players);
      setQuickPasteStatus(`Synced & saved ${parsed.players.length} players to database.`);
      showNotification(`Synced roster with ${parsed.players.length} players.`);
      setRawRosterInput('');
      setTimeout(() => setQuickPasteStatus(null), 5000);
    }
  };

  const changedDiffRecords = rosterPreview?.diffs.filter(d => d.status === 'updated' || d.status === 'new') || [];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSection('roster')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeSection === 'roster'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Roster Spreadsheet Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('schedule')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeSection === 'schedule'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Spreadsheet Sync</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('quickpaste')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeSection === 'quickpaste'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Quick-Paste Text Parser</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('backup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeSection === 'backup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Baseline Reset</span>
        </button>
      </div>

      {/* SECTION 1: ROSTER SPREADSHEET SYNC */}
      {activeSection === 'roster' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                    1-Click Roster Google Sheet &amp; CSV Sync
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Persist your master Google Sheet URL, automatically resolve rightmost Height/Weight/GPA columns, and inspect field diffs before saving.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadRosterCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export Current Roster CSV</span>
              </button>
            </div>

            {rosterError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-3 text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{rosterError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRosterError(null)}
                  className="text-red-300 hover:text-white font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Sync Mode Selector */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Sync Import Strategy:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRosterSyncMode('merge')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    rosterSyncMode === 'merge'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Merge &amp; Update Existing (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setRosterSyncMode('replace')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    rosterSyncMode === 'replace'
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Replace Full Roster
                </button>
              </div>
            </div>

            {/* Two input columns: Google Sheets URL vs Local CSV File */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Option A: Saved Google Sheets Link */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Option A: Saved Google Sheets Live Link
                    </h4>
                  </div>
                  {teamInfo?.rosterGoogleSheetUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono">Saved in Cloud</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Paste your master Google Sheet link (shared as "Anyone with link can view"). It stays saved for 1-click weekly diff checks.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={rosterGoogleSheetUrl}
                    onChange={e => setRosterGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onSaveTeamInfo && (
                      <button
                        type="button"
                        onClick={handleSaveRosterSheetUrl}
                        disabled={!rosterGoogleSheetUrl.trim()}
                        title="Save Google Sheet URL to team settings"
                        className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleFetchRosterGoogleSheet}
                      disabled={isLoadingRosterUrl || !rosterGoogleSheetUrl.trim()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shrink-0 transition-colors whitespace-nowrap"
                    >
                      {isLoadingRosterUrl ? 'Comparing...' : 'Fetch & Compare Diff'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Option B: Local CSV File */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Option B: Upload Local CSV File
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Select <code>roster.csv</code> or any exported spreadsheet from your computer to preview field-by-field updates.
                </p>

                <label className="block p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-900 text-center cursor-pointer transition-colors">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Click to select CSV file &amp; compare diffs
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleRosterFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview & Field-by-Field Diff Box */}
            {rosterPreview && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                      <span>Sync Comparison Ready</span>
                      <span>·</span>
                      <span>{rosterPreview.players.length} Total Players</span>
                      <span>·</span>
                      <span>{rosterPreview.updatedWithChangesCount} with Field Changes</span>
                      <span>·</span>
                      <span>{rosterPreview.newCount} New</span>
                    </div>
                    <h4 className="font-condensed font-black text-lg uppercase text-white mt-0.5">
                      Review Field-by-Field Roster Changes Before Saving
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('diffs')}
                        className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                          previewTab === 'diffs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Field Changes ({changedDiffRecords.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('table')}
                        className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition-colors ${
                          previewTab === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Full Table ({rosterPreview.players.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRosterPreview(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyRosterSync}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/40 cursor-pointer whitespace-nowrap"
                    >
                      Apply &amp; Save to Firestore
                    </button>
                  </div>
                </div>

                {previewTab === 'diffs' ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {changedDiffRecords.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                        All matched players are already in sync with this spreadsheet. Switch to "Full Table" to inspect all rows, or click "Apply &amp; Save" to re-confirm.
                      </div>
                    ) : (
                      changedDiffRecords.map(diff => (
                        <div
                          key={diff.playerId}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-[#00ADEF]">#{diff.jerseyNumber}</span>
                            <span className="font-bold text-white">{diff.name}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                diff.status === 'new'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {diff.status === 'new' ? 'NEW PLAYER' : `${diff.changes.length} FIELD(S) UPDATED`}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {diff.changes.map((chg, idx) => (
                              <div
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] flex items-center gap-1.5"
                              >
                                <span className="text-slate-400">{chg.label}:</span>
                                <span className="text-slate-500 line-through max-w-[110px] truncate">{chg.before}</span>
                                <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="text-emerald-400 font-bold max-w-[150px] truncate">{chg.after}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-72 rounded-xl border border-slate-800 bg-slate-950/80 text-xs tabular-nums">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-condensed sticky top-0">
                        <tr>
                          <th className="p-2 w-12 text-center">#</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Position</th>
                          <th className="p-2">Height</th>
                          <th className="p-2">Weight</th>
                          <th className="p-2">GPA</th>
                          <th className="p-2">Grad</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Flyer / Doc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {rosterPreview.players.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="p-2 text-center font-bold text-[#00ADEF] font-mono">#{p.jerseyNumber}</td>
                            <td className="p-2 font-bold">{p.name}</td>
                            <td className="p-2 text-slate-400">{p.specificPosition || p.primaryPosition}</td>
                            <td className="p-2 font-mono">{p.height}</td>
                            <td className="p-2 font-mono text-slate-400">{p.weight || '—'}</td>
                            <td className="p-2 font-mono text-emerald-400 font-bold">{p.gpa}</td>
                            <td className="p-2 font-mono">{p.gradYear}</td>
                            <td className="p-2 text-slate-300 truncate max-w-[160px]">{p.contactEmail || '—'}</td>
                            <td className="p-2 text-slate-400 truncate max-w-[150px]">{p.profileDocUrl || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: SCHEDULE SPREADSHEET SYNC */}
      {activeSection === 'schedule' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                    Match Schedule Spreadsheet Sync
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Import entire league season fixtures, dates, kickoff times, addresses, and scores.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadScheduleCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export Schedule CSV</span>
              </button>
            </div>

            {scheduleError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-3 text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleError(null)}
                  className="text-red-300 hover:text-white font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Inputs: Google Sheets or Local CSV */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Google Sheets Schedule Link
                  </h4>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scheduleGoogleSheetUrl}
                    onChange={e => setScheduleGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleFetchScheduleGoogleSheet}
                    disabled={isLoadingScheduleUrl || !scheduleGoogleSheetUrl.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shrink-0 transition-colors"
                  >
                    {isLoadingScheduleUrl ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Upload Schedule CSV
                  </h4>
                </div>
                <label className="block p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-900 text-center cursor-pointer transition-colors">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Click to select CSV schedule
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleScheduleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Schedule Preview */}
            {schedulePreview && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-blue-500/40 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-condensed font-black text-lg uppercase text-white">
                    Preview: {schedulePreview.matches.length} Match Fixtures Found
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSchedulePreview(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyScheduleSync}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/40 cursor-pointer"
                    >
                      Apply &amp; Save Schedule
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-60 rounded-xl border border-slate-800 bg-slate-950/80 text-xs tabular-nums">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-condensed">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">Opponent</th>
                        <th className="p-2">H/A</th>
                        <th className="p-2">Venue</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {schedulePreview.matches.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-2 font-mono">{m.date}</td>
                          <td className="p-2 text-slate-400">{m.time}</td>
                          <td className="p-2 font-bold">{m.opponent}</td>
                          <td className="p-2">{m.isHome ? 'Home' : 'Away'}</td>
                          <td className="p-2 text-slate-400">{m.venue}</td>
                          <td className="p-2">{m.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: QUICK-PASTE TEXT PARSER */}
      {activeSection === 'quickpaste' && (
        <div className="p-5 rounded-2xl bg-[#0c1425] border border-blue-900/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-condensed font-black text-xl uppercase text-white">
              Quick-Paste Roster Text Assistant
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Have a raw roster list from TeamSnap, SportsEngine, or an email? Paste it here (one player per line) and our parser will automatically detect jersey numbers, player names, positions, graduation years, and GPAs.
          </p>

          <textarea
            rows={6}
            value={rawRosterInput}
            onChange={e => setRawRosterInput(e.target.value)}
            placeholder={'Paste roster lines here, e.g.:\n1 Eliot Kline GK Menlo School 4.00\n2 SavvyinerRB St Francis\n7 Kaia Vance FW Cupertino 2028...'}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={handleParseRawText}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-condensed font-bold text-sm uppercase tracking-wider shadow-md transition-colors cursor-pointer"
            >
              Parse &amp; Save to Roster
            </button>
            {quickPasteStatus && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                {quickPasteStatus}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: RESET / BASELINE */}
      {activeSection === 'backup' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h4 className="font-condensed font-black text-lg uppercase text-slate-900 dark:text-white mb-1">
              Reset Team Baseline Data
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore default De Anza Force players, realistic stats, match fixtures, and NorCal standings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Everything to Defaults</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1627] border border-red-500/50 p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/30 text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                  Reset All Team Data?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This will overwrite all current changes</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to reset all players, coaches, match schedule, and standings back to the official default baseline?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setShowResetConfirm(false);
                  showNotification('Reset team database to official baseline defaults.');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
