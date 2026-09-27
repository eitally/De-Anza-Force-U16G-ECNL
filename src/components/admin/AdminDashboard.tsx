import React, { useState } from 'react';
import type { 
  Player, 
  Match, 
  StandingTeam, 
  Coach, 
  TeamInfo, 
  ActionPhoto, 
  GooglePhotosAlbum, 
  MasterAlbumInfo 
} from '../../types';
import { PlayerEditorTab } from '../editor/PlayerEditorTab';
import { CoachEditorTab } from '../editor/CoachEditorTab';
import { ScheduleEditorTab } from '../editor/ScheduleEditorTab';
import { StandingsEditorTab } from '../editor/StandingsEditorTab';
import { TeamInfoEditorTab } from '../editor/TeamInfoEditorTab';
import { MediaEditorTab } from '../editor/MediaEditorTab';
import { ImportExportTab } from '../editor/ImportExportTab';
import { GameDayQuickScore } from './GameDayQuickScore';
import { syncStandingsAndTeamInfoWithMatches } from '../../utils/recordUtils';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Trophy, 
  ShieldCheck, 
  Camera, 
  Sliders, 
  CheckCircle2, 
  ExternalLink, 
  ArrowLeft, 
  LogOut, 
  Shield 
} from 'lucide-react';

export type AdminTab = 'players' | 'coaches' | 'schedule' | 'standings' | 'team' | 'media' | 'import_export';

interface AdminDashboardProps {
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
  onExitAdmin: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  teamInfo,
  players,
  matches,
  standings,
  coaches,
  onSavePlayers,
  onSaveMatches,
  onSaveStandings,
  onSaveCoaches,
  onSaveTeamInfo,
  onResetToDefaults,
  onExitAdmin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('players');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAutoSyncRecordAndForm = () => {
    const synced = syncStandingsAndTeamInfoWithMatches(matches, standings, teamInfo);
    onSaveStandings(synced.updatedStandings);
    onSaveTeamInfo(synced.updatedTeamInfo);
    showNotification(`⚡ Auto-synced record (${synced.computed.wins}W-${synced.computed.losses}L-${synced.computed.draws}D) and form from schedule!`);
  };

  const tabs = [
    { id: 'players' as AdminTab, label: 'Roster', icon: Users, count: players.length },
    { id: 'coaches' as AdminTab, label: 'Coaching Staff', icon: Briefcase, count: coaches.length },
    { id: 'schedule' as AdminTab, label: 'Match Schedule', icon: Calendar, count: matches.length },
    { id: 'standings' as AdminTab, label: 'Standings & Record', icon: Trophy },
    { id: 'team' as AdminTab, label: 'Team Branding', icon: ShieldCheck },
    { id: 'media' as AdminTab, label: 'Squad Portrait', icon: Camera },
    { id: 'import_export' as AdminTab, label: 'Spreadsheet Sync', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#080d17]/95 backdrop-blur-md border-b border-blue-900/50 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 shrink-0 font-condensed font-black">
            DF
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-condensed font-black text-lg sm:text-xl uppercase tracking-wide text-white truncate">
                {teamInfo.teamName} Portal
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Administration Workspace • {teamInfo.ageGroup}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {notification && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 text-xs font-bold border border-emerald-800/80 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-xs">{notification}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Game Day Quick Score Bar */}
        <GameDayQuickScore
          matches={matches}
          standings={standings}
          teamInfo={teamInfo}
          onSaveMatches={onSaveMatches}
          onSaveStandings={onSaveStandings}
          onSaveTeamInfo={onSaveTeamInfo}
          showNotification={showNotification}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0a101f] rounded-2xl border border-blue-900/50 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Panel */}
        <div className="bg-[#0a101f]/90 rounded-3xl border border-blue-900/40 p-4 sm:p-6 shadow-2xl">
          {activeTab === 'players' && (
            <PlayerEditorTab
              players={players}
              onSavePlayers={onSavePlayers}
              showNotification={showNotification}
              onOpenSyncTab={() => setActiveTab('import_export')}
            />
          )}

          {activeTab === 'coaches' && (
            <CoachEditorTab
              coaches={coaches}
              onSaveCoaches={onSaveCoaches}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleEditorTab
              matches={matches}
              onSaveMatches={onSaveMatches}
              showNotification={showNotification}
              onAutoSyncRecordAndForm={handleAutoSyncRecordAndForm}
              onOpenSyncTab={() => setActiveTab('import_export')}
            />
          )}

          {activeTab === 'standings' && (
            <StandingsEditorTab
              standings={standings}
              teamInfo={teamInfo}
              onSaveStandings={onSaveStandings}
              onSaveTeamInfo={onSaveTeamInfo}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'team' && (
            <TeamInfoEditorTab
              teamInfo={teamInfo}
              onSaveTeamInfo={onSaveTeamInfo}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'media' && (
            <MediaEditorTab
              teamInfo={teamInfo}
              onSaveTeamInfo={onSaveTeamInfo}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'import_export' && (
            <ImportExportTab
              players={players}
              matches={matches}
              onSavePlayers={onSavePlayers}
              onSaveMatches={onSaveMatches}
              onResetToDefaults={onResetToDefaults}
              showNotification={showNotification}
            />
          )}
        </div>
      </main>
    </div>
  );
};
