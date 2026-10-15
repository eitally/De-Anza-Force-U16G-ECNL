import React, { useState, useEffect } from 'react';
import type { Player, Match, StandingTeam, TeamInfo } from '../../types';
import {
  parseRosterCSV,
  parseScheduleCSV,
  parseStandingsCSV,
  normalizeGoogleSheetUrl,
  type PlayerDiffRecord,
} from '../../utils/csvSync';
import {
  getSunday9pmPacificWindow,
  fetchStandingsFromGoogleSheet,
  buildUpdatedTeamInfoFromStandings,
  LATEST_VERIFIED_ROSTER_CSV,
} from '../../utils/standingsCron';
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
  Trophy,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface ImportExportTabProps {
  players: Player[];
  matches?: Match[];
  standings?: StandingTeam[];
  teamInfo?: TeamInfo;
  onSavePlayers: (players: Player[]) => void;
  onSaveMatches?: (matches: Match[]) => void;
  onSaveStandings?: (standings: StandingTeam[]) => void;
  onSaveTeamInfo?: (info: TeamInfo) => void;
  onResetToDefaults: () => void;
  showNotification: (msg: string) => void;
}

export const ImportExportTab: React.FC<ImportExportTabProps> = ({
  players,
  matches = [],
  standings = [],
  teamInfo,
  onSavePlayers,
  onSaveMatches,
  onSaveStandings,
  onSaveTeamInfo,
  onResetToDefaults,
  showNotification,
}) => {
  // Active sub-section
  const [activeSection, setActiveSection] = useState<'roster' | 'standings' | 'schedule' | 'quickpaste' | 'backup'>('standings');

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

  // Standings (League Table) Google Sheet sync state
  const [standingsGoogleSheetUrl, setStandingsGoogleSheetUrl] = useState(teamInfo?.standingsGoogleSheetUrl || '');
  const [standingsCronEnabled, setStandingsCronEnabled] = useState<boolean>(teamInfo?.standingsCronEnabled ?? true);
  const [isLoadingStandingsUrl, setIsLoadingStandingsUrl] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsPreview, setStandingsPreview] = useState<{
    standings: StandingTeam[];
    teamCount: number;
    forceTeam?: StandingTeam;
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

  const { nextSundayFormatted } = getSunday9pmPacificWindow();

  useEffect(() => {
    if (teamInfo?.rosterGoogleSheetUrl && !rosterGoogleSheetUrl) {
      setRosterGoogleSheetUrl(teamInfo.rosterGoogleSheetUrl);
    }
    if (teamInfo?.standingsGoogleSheetUrl && !standingsGoogleSheetUrl) {
      setStandingsGoogleSheetUrl(teamInfo.standingsGoogleSheetUrl);
    }
    if (teamInfo?.scheduleGoogleSheetUrl && !scheduleGoogleSheetUrl) {
      setScheduleGoogleSheetUrl(teamInfo.scheduleGoogleSheetUrl);
    }
    if (teamInfo?.standingsCronEnabled !== undefined) {
      setStandingsCronEnabled(teamInfo.standingsCronEnabled);
    }
  }, [
    teamInfo?.rosterGoogleSheetUrl,
    teamInfo?.standingsGoogleSheetUrl,
    teamInfo?.scheduleGoogleSheetUrl,
    teamInfo?.standingsCronEnabled,
  ]);

  // Helper to fetch CSV via server proxy with direct client fetch fallback
  const fetchSheetCsvText = async (rawSheetUrl: string, saveForCron: boolean = false): Promise<string> => {
    const exportUrl = normalizeGoogleSheetUrl(rawSheetUrl);
    try {
      const proxyRes = await fetch('/api/ecnl/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: exportUrl, saveForCron }),
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.csvText) return data.csvText;
      }
    } catch {
      // Fallback to direct client fetch
    }

    const res = await fetch(exportUrl);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch sheet (HTTP ${res.status}). Make sure the Google Sheet is shared as "Anyone with the link can view".`
      );
    }
    const text = await res.text();
    if (text.trim().startsWith('<!DOCTYPE html>') || text.includes('<html')) {
      throw new Error(
        'Google Sheet returned a sign-in page instead of CSV. Ensure link sharing is set to "Anyone with the link can view".'
      );
    }
    return text;
  };

  // ---------------------------------------------
  // STANDINGS (LEAGUE TABLE) SYNC HANDLERS
  // ---------------------------------------------
  const handleSaveStandingsSheetConfig = (newCronEnabled?: boolean) => {
    const cronFlag = newCronEnabled !== undefined ? newCronEnabled : standingsCronEnabled;
    if (newCronEnabled !== undefined) {
      setStandingsCronEnabled(newCronEnabled);
    }
    if (teamInfo && onSaveTeamInfo) {
      onSaveTeamInfo({
        ...teamInfo,
        standingsGoogleSheetUrl: standingsGoogleSheetUrl.trim(),
        standingsCronEnabled: cronFlag,
      });
    }
    fetch('/api/ecnl/configure-cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        standingsGoogleSheetUrl: standingsGoogleSheetUrl.trim(),
        standingsCronEnabled: cronFlag,
      }),
    }).catch(() => {});
    showNotification(
      cronFlag
        ? 'Saved League Table Google Sheet URL & enabled Sunday 9:00 PM PT auto-sync.'
        : 'Saved League Table Google Sheet settings.'
    );
  };

  const handleFetchStandingsGoogleSheet = async () => {
    if (!standingsGoogleSheetUrl.trim()) return;
    setIsLoadingStandingsUrl(true);
    setStandingsError(null);

    if (teamInfo && onSaveTeamInfo && standingsGoogleSheetUrl.trim() !== teamInfo.standingsGoogleSheetUrl) {
      onSaveTeamInfo({
        ...teamInfo,
        standingsGoogleSheetUrl: standingsGoogleSheetUrl.trim(),
        standingsCronEnabled,
      });
    }

    try {
      const parsed = await fetchStandingsFromGoogleSheet(standingsGoogleSheetUrl.trim());
      if (parsed.errors.length > 0 && parsed.standings.length === 0) {
        const errMsg = parsed.errors.join(' | ');
        setStandingsError(errMsg);
        showNotification(`Standings Sheet Error: ${errMsg}`);
        return;
      }
      setStandingsPreview({
        standings: parsed.standings,
        teamCount: parsed.teamCount,
        forceTeam: parsed.forceTeam,
        columnsFound: parsed.columnsFound,
        errors: parsed.errors,
      });
    } catch (err: any) {
      const msg = err?.message || 'Could not load League Table Google Sheet.';
      setStandingsError(msg);
      showNotification(`Sheet fetch error: ${msg}`);
    } finally {
      setIsLoadingStandingsUrl(false);
    }
  };

  const handleStandingsFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStandingsError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (!text) return;
      const parsed = parseStandingsCSV(text);
      if (parsed.errors.length > 0 && parsed.standings.length === 0) {
        const errMsg = parsed.errors.join(' | ');
        setStandingsError(errMsg);
        showNotification(`Standings CSV Error: ${errMsg}`);
        return;
      }
      setStandingsPreview({
        standings: parsed.standings,
        teamCount: parsed.teamCount,
        forceTeam: parsed.forceTeam,
        columnsFound: parsed.columnsFound,
        errors: parsed.errors,
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyStandingsSync = () => {
    if (!standingsPreview || !onSaveStandings) return;
    onSaveStandings(standingsPreview.standings);
    if (teamInfo && onSaveTeamInfo) {
      const updatedInfo = buildUpdatedTeamInfoFromStandings(
        standingsPreview.standings,
        teamInfo,
        standingsGoogleSheetUrl.trim() || teamInfo.standingsGoogleSheetUrl
      );
      onSaveTeamInfo(updatedInfo);
    }
    fetch('/api/ecnl/configure-cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        standingsGoogleSheetUrl: standingsGoogleSheetUrl.trim(),
        standingsCronEnabled,
      }),
    }).catch(() => {});

    showNotification(
      `Updated League Table (${standingsPreview.teamCount} teams) from Google Sheet${
        standingsPreview.forceTeam
          ? ` — Force #${standingsPreview.forceTeam.rank} (${standingsPreview.forceTeam.won}-${standingsPreview.forceTeam.lost}-${standingsPreview.forceTeam.drawn})`
          : ''
      }.`
    );
    setStandingsPreview(null);
  };

  const handleDownloadStandingsCSV = () => {
    const headers = [
      'Rank',
      'Team Name',
      'MP',
      'W',
      'L',
      'D',
      'GF',
      'GA',
      'GD',
      'PTS',
      'PPG',
      'Form',
      'Qualification',
    ];
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const rows = standings.map(t =>
      [
        t.rank,
        t.teamName,
        t.played,
        t.won,
        t.lost,
        t.drawn,
        t.goalsFor,
        t.goalsAgainst,
        t.goalDifference,
        t.points,
        Number(t.pointsPerGame || 0).toFixed(2),
        (t.form || []).join(''),
        t.qualification || 'n/a',
      ]
        .map(escapeCSV)
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeAnzaForce_U16G_ECNL_Standings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported League Table CSV.');
  };

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
      const text = await fetchSheetCsvText(rosterGoogleSheetUrl);
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
      'Jersey Number',
      'Full Player Name',
      'Phone Number',
      'Player Email',
      'Primary Position Category',
      'Specific Position Title',
      'Graduation Year',
      'Date of Birth',
      'Height',
      'Weight',
      'Dominant Foot',
      'High School',
      'GPA',
      'College Commitment',
      'NCAA Eligibility ID',
      'Highlight Video URL',
      'Instagram Profile URL',
      'Player Profile PDF Link',
      'Player Headshot Photo URL',
      'Player Bio & Tactical Profile',
      'Honors & Accolades',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = players.map(p => {
      const safePhoto = p.photoUrl && p.photoUrl.startsWith('data:') ? '[Uploaded Local Photo]' : p.photoUrl || '';
      return [
        p.jerseyNumber,
        p.name,
        p.phone || '',
        p.contactEmail || '',
        p.primaryPosition,
        p.specificPosition,
        p.gradYear,
        p.birthday || '',
        p.height,
        p.weight || '',
        p.dominantFoot,
        p.highSchool,
        p.gpa,
        p.commitment,
        p.ncaaId || '',
        p.highlightsUrl || '',
        p.instagram || '',
        p.profilePdfUrl || p.profileDocUrl || '',
        safePhoto,
        p.bio || '',
        (p.awards || []).join('; '),
      ]
        .map(escapeCSV)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeAnzaForce_U16G_ECNL_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported Roster CSV spreadsheet.');
  };

  // ---------------------------------------------
  // SCHEDULE SYNC HANDLERS
  // ---------------------------------------------
  const handleSaveScheduleSheetUrl = () => {
    if (!teamInfo || !onSaveTeamInfo) return;
    onSaveTeamInfo({
      ...teamInfo,
      scheduleGoogleSheetUrl: scheduleGoogleSheetUrl.trim(),
    });
    showNotification('Saved Schedule Google Sheet URL to team settings.');
  };

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
      const text = await fetchSheetCsvText(scheduleGoogleSheetUrl);
      processScheduleCSVText(text);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Could not load schedule sheet.';
      setScheduleError(msg);
      showNotification(`Schedule fetch error: ${msg}`);
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
    showNotification(`Successfully synced ${schedulePreview.matches.length} fixtures to the schedule.`);
    setSchedulePreview(null);
  };

  const handleDownloadScheduleCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Opponent',
      'Opponent Location',
      'Home/Away',
      'Competition',
      'Venue',
      'Field Number',
      'Address',
      'Status',
      'Team Score',
      'Opponent Score',
      'Home Kit Color',
      'Away Kit Color',
      'Video URL',
      'Game Notes',
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = matches.map(m => {
      return [
        m.date,
        m.time,
        m.opponent,
        m.opponentLocation || '',
        m.isHome ? 'Home' : 'Away',
        m.competition,
        m.venue,
        m.fieldNumber || '',
        m.address,
        m.status,
        m.teamScore ?? '',
        m.opponentScore ?? '',
        m.homeKitColor,
        m.awayKitColor,
        m.videoLiveStreamUrl || '',
        m.gameNotes || '',
      ]
        .map(escapeCSV)
        .join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeAnzaForce_U16G_ECNL_Schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported Match Schedule CSV.');
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
          onClick={() => setActiveSection('standings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeSection === 'standings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>League Table (Standings) Sheet Sync</span>
        </button>

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

      {/* SECTION 0: LEAGUE TABLE (STANDINGS) GOOGLE SHEET & WEEKLY CRON SYNC */}
      {activeSection === 'standings' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                    ECNL NorCal GU16 League Table — Google Sheet &amp; Weekly Cron Sync
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Connect your AppScript Google Sheet to update the 12-team ECNL NorCal standings on demand and automatically every Sunday at 9:00 PM Pacific.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadStandingsCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Export Current Table CSV</span>
              </button>
            </div>

            {/* Weekly Sunday 9:00 PM Pacific Cron Banner */}
            <div className="p-4 rounded-xl bg-emerald-950/20 dark:bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                    <span>Weekly Automatic Cron: Every Sunday @ 9:00 PM Pacific (PT)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]">
                      0 21 * * 0
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Next scheduled sync: <strong className="text-slate-800 dark:text-slate-200">{nextSundayFormatted}</strong>
                    {teamInfo?.lastStandingsSheetSyncAt && (
                      <>
                        {' • '}Last Sheet sync:{' '}
                        <strong className="text-emerald-400">
                          {new Date(teamInfo.lastStandingsSheetSyncAt).toLocaleString()}
                        </strong>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={standingsCronEnabled}
                  onChange={e => handleSaveStandingsSheetConfig(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Enable Sunday 9pm PT Auto-Sync</span>
              </label>
            </div>

            {standingsError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-3 text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{standingsError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStandingsError(null)}
                  className="text-red-300 hover:text-white font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Option A: Saved AppScript Google Sheet Link */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Option A: AppScript League Table Google Sheet URL
                    </h4>
                  </div>
                  {teamInfo?.standingsGoogleSheetUrl && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Saved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Paste the URL of the Google Sheet tab updated by your AppScript (supports <code className="text-emerald-400">#gid=...</code> for specific tabs). Ensure sharing is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={standingsGoogleSheetUrl}
                    onChange={e => setStandingsGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveStandingsSheetConfig()}
                    disabled={!standingsGoogleSheetUrl.trim()}
                    title="Save URL for weekly Sunday 9pm PT cron"
                    className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFetchStandingsGoogleSheet}
                    disabled={!standingsGoogleSheetUrl.trim() || isLoadingStandingsUrl}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStandingsUrl ? 'animate-spin' : ''}`} />
                    <span>{isLoadingStandingsUrl ? 'Syncing...' : 'Sync Sheet'}</span>
                  </button>
                </div>
              </div>

              {/* Option B: Upload Local Standings CSV */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Option B: Upload League Table CSV File
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Recognizes standard columns (<code className="text-blue-400">Rank, Team, MP/GP, W, L, D/T, GF, GA, GD, PTS, PPG</code>) as well as raw ECNL table exports.
                  </p>
                </div>

                <label className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer block">
                  <span>Choose Standings .CSV File...</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleStandingsFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Standings Preview Table */}
            {standingsPreview && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>
                        League Table Ready: {standingsPreview.teamCount} Teams Parsed
                        {standingsPreview.forceTeam
                          ? ` • De Anza Force Ranked #${standingsPreview.forceTeam.rank} (${standingsPreview.forceTeam.won}-${standingsPreview.forceTeam.lost}-${standingsPreview.forceTeam.drawn}, ${standingsPreview.forceTeam.pointsPerGame.toFixed(2)} PPG)`
                          : ''}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Detected columns: {standingsPreview.columnsFound.join(', ') || 'Auto-detected ECNL table format'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStandingsPreview(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyStandingsSync}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Apply League Table Update</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/90">
                  <table className="w-full text-left text-[11px] text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Club / Team</th>
                        <th className="py-2 px-2 text-center">MP</th>
                        <th className="py-2 px-2 text-center">W</th>
                        <th className="py-2 px-2 text-center">L</th>
                        <th className="py-2 px-2 text-center">D</th>
                        <th className="py-2 px-2 text-center">GF</th>
                        <th className="py-2 px-2 text-center">GA</th>
                        <th className="py-2 px-2 text-center">GD</th>
                        <th className="py-2 px-2 text-center">PTS</th>
                        <th className="py-2 px-3 text-right">PPG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {standingsPreview.standings.map(t => {
                        const isForce = t.isCurrentTeam || t.isForce || t.teamName.toLowerCase().includes('force');
                        return (
                          <tr
                            key={t.teamName}
                            className={isForce ? 'bg-[#00ADEF]/15 text-white font-bold' : ''}
                          >
                            <td className="py-2 px-3 font-mono">{t.rank}</td>
                            <td className="py-2 px-3">
                              {t.teamName}
                              {isForce && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-[#00ADEF] text-slate-950 text-[9px] font-black uppercase">
                                  OUR SQUAD
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center font-mono">{t.played}</td>
                            <td className="py-2 px-2 text-center font-mono text-emerald-400">{t.won}</td>
                            <td className="py-2 px-2 text-center font-mono text-red-400">{t.lost}</td>
                            <td className="py-2 px-2 text-center font-mono text-amber-300">{t.drawn}</td>
                            <td className="py-2 px-2 text-center font-mono">{t.goalsFor}</td>
                            <td className="py-2 px-2 text-center font-mono">{t.goalsAgainst}</td>
                            <td className="py-2 px-2 text-center font-mono">
                              {t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold">{t.points}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#00ADEF]">
                              {Number(t.pointsPerGame || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => processRosterCSVText(LATEST_VERIFIED_ROSTER_CSV)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Preview Latest 25-Player Sheet Snapshot</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRosterCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Export Current Roster CSV</span>
                </button>
              </div>
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
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Saved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Paste your Google Sheet link once and click <strong>Save</strong> or <strong>Sync Sheet</strong>. Ensure sheet access is set to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={rosterGoogleSheetUrl}
                    onChange={e => setRosterGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                  {onSaveTeamInfo && (
                    <button
                      type="button"
                      onClick={handleSaveRosterSheetUrl}
                      disabled={!rosterGoogleSheetUrl.trim()}
                      title="Save Google Sheet URL for future 1-click syncs"
                      className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleFetchRosterGoogleSheet}
                    disabled={!rosterGoogleSheetUrl.trim() || isLoadingRosterUrl}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {isLoadingRosterUrl ? 'Syncing...' : 'Sync Sheet'}
                  </button>
                </div>
              </div>

              {/* Option B: Upload CSV File */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Option B: Upload Local .CSV File
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload a <code className="text-blue-400">.csv</code> file exported from Excel, Apple Numbers, or Google Sheets.
                  </p>
                </div>

                <label className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors cursor-pointer block">
                  <span>Choose Roster .CSV File...</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleRosterFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Roster Preview & Field-by-Field Diff Box */}
            {rosterPreview && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>
                        Sync Preview Ready: {rosterPreview.updatedWithChangesCount} Modified, {rosterPreview.newCount} New,{' '}
                        {rosterPreview.matchedCount - rosterPreview.updatedWithChangesCount} Unchanged
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Detected columns: {rosterPreview.columnsFound.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('diffs')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer ${
                          previewTab === 'diffs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Field Changes ({changedDiffRecords.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('table')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer ${
                          previewTab === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Full Squad ({rosterPreview.players.length})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRosterPreview(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyRosterSync}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Apply Roster Update</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {previewTab === 'diffs' ? (
                  changedDiffRecords.length === 0 ? (
                    <div className="p-6 rounded-lg border border-slate-800 bg-slate-950/80 text-center text-xs text-slate-400">
                      All {rosterPreview.players.length} players in the sheet match the current database values. Switch to <strong>Full Squad</strong> to inspect all rows.
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/90 divide-y divide-slate-800/70">
                      {changedDiffRecords.map(diff => (
                        <div key={diff.playerId} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono font-bold text-[#00ADEF]">#{diff.jerseyNumber}</span>
                            <span className="font-bold text-white">{diff.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                diff.status === 'new'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {diff.status === 'new' ? 'New Player' : `${diff.changes.length} Changed`}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {diff.changes.map(c => (
                              <span
                                key={c.field}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]"
                              >
                                <strong className="text-slate-400">{c.label}:</strong>
                                <span className="text-red-400 line-through max-w-[120px] truncate">{c.before}</span>
                                <span className="text-slate-500">→</span>
                                <span className="text-emerald-300 font-semibold max-w-[160px] truncate">{c.after}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80">
                    <table className="w-full text-left text-[11px] text-slate-300">
                      <thead className="bg-slate-900 text-slate-400 uppercase font-bold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">#</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Pos</th>
                          <th className="py-2 px-3">Grad</th>
                          <th className="py-2 px-3">Ht / Wt</th>
                          <th className="py-2 px-3">GPA</th>
                          <th className="py-2 px-3">High School</th>
                          <th className="py-2 px-3">Email / Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {rosterPreview.players.map(p => (
                          <tr key={p.id}>
                            <td className="py-1.5 px-3 font-bold text-blue-400">#{p.jerseyNumber}</td>
                            <td className="py-1.5 px-3 font-semibold text-white">{p.name}</td>
                            <td className="py-1.5 px-3">{p.specificPosition}</td>
                            <td className="py-1.5 px-3">{p.gradYear}</td>
                            <td className="py-1.5 px-3">
                              {p.height} / {p.weight || '—'}
                            </td>
                            <td className="py-1.5 px-3 text-emerald-400 font-bold">{p.gpa}</td>
                            <td className="py-1.5 px-3">{p.highSchool}</td>
                            <td className="py-1.5 px-3 text-slate-400">
                              {p.contactEmail || '—'} {p.phone ? `• ${p.phone}` : ''}
                            </td>
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
                <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
                    Match Schedule CSV &amp; Google Sheets Sync
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bulk-import season fixtures, dates, kick-off times, field numbers, and final match scores.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadScheduleCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-500" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Option A: Saved Google Sheets Schedule URL
                    </h4>
                  </div>
                  {teamInfo?.scheduleGoogleSheetUrl && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Saved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Paste a Google Sheet URL containing your match schedule (columns: Date, Time, Opponent, Home/Away, Venue, Team Score, Opponent Score).
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scheduleGoogleSheetUrl}
                    onChange={e => setScheduleGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                  />
                  {onSaveTeamInfo && (
                    <button
                      type="button"
                      onClick={handleSaveScheduleSheetUrl}
                      disabled={!scheduleGoogleSheetUrl.trim()}
                      className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleFetchScheduleGoogleSheet}
                    disabled={!scheduleGoogleSheetUrl.trim() || isLoadingScheduleUrl}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    {isLoadingScheduleUrl ? 'Syncing...' : 'Sync Sheet'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-4 h-4 text-blue-500" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Option B: Upload Schedule .CSV File
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Export the current schedule CSV first to use as a clean template, edit in Excel/Sheets, and re-upload.
                  </p>
                </div>

                <label className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 text-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors cursor-pointer block">
                  <span>Choose Schedule .CSV File...</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleScheduleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {schedulePreview && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Ready to Sync {schedulePreview.matches.length} Match Fixtures</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSchedulePreview(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyScheduleSync}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Apply Schedule Update</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: QUICK PASTE TEXT PARSER */}
      {activeSection === 'quickpaste' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">
              Quick-Paste Roster Text Parser
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Copy cells directly from Google Sheets or Excel and paste them below to merge with your roster.
          </p>

          {quickPasteStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{quickPasteStatus}</span>
            </div>
          )}

          <textarea
            value={rawRosterInput}
            onChange={e => setRawRosterInput(e.target.value)}
            rows={7}
            placeholder={
              'Jersey Number,Full Player Name,Primary Position,Graduation Year,Height,GPA,High School\n1,Eliot Kline,Goalkeeper,2029,5\'7",4.00,Burlingame High School'
            }
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleParseRawText}
            disabled={!rawRosterInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Parse &amp; Merge Roster Data
          </button>
        </div>
      )}

      {/* SECTION 4: BASELINE RESET */}
      {activeSection === 'backup' && (
        <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Reset All Team Data to Official Baseline</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Restores the default De Anza Force U16G ECNL roster, match schedule, and coaching staff.
            </p>
          </div>
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetToDefaults();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Full Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
