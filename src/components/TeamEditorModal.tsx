import React, { useState, useEffect } from 'react';
import type { 
  Player, 
  Match, 
  StandingTeam, 
  Coach, 
  TeamInfo, 
  ActionPhoto, 
  GooglePhotosAlbum, 
  MasterAlbumInfo 
} from '../types';
import { PlayerEditorTab } from './editor/PlayerEditorTab';
import { CoachEditorTab } from './editor/CoachEditorTab';
import { ScheduleEditorTab } from './editor/ScheduleEditorTab';
import { StandingsEditorTab } from './editor/StandingsEditorTab';
import { TeamInfoEditorTab } from './editor/TeamInfoEditorTab';
import { MediaEditorTab } from './editor/MediaEditorTab';
import { ImportExportTab } from './editor/ImportExportTab';
import { syncStandingsAndTeamInfoWithMatches } from '../utils/recordUtils';
import { 
  X, 
  Users, 
  Briefcase, 
  Calendar, 
  Trophy, 
  ShieldCheck, 
  Camera, 
  Sliders, 
  CheckCircle2 
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
  onSaveAllData?: (data: any) => void;
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
  onSaveAllData,
  onResetToDefaults,
  initialEditingPlayer,
  initialEditingCoach,
  initialTab = 'players',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<EditorTab>(initialTab);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleAutoSyncRecordAndForm = () => {
    const synced = syncStandingsAndTeamInfoWithMatches(matches, standings, teamInfo);
    onSaveStandings(synced.updatedStandings);
    onSaveTeamInfo(synced.updatedTeamInfo);
    showNotification(`⚡ Auto-synced record (${synced.computed.wins}W-${synced.computed.losses}L-${synced.computed.draws}D) and form from schedule!`);
  };

  const tabs = [
    { id: 'players' as EditorTab, label: 'Roster', icon: Users, count: players.length },
    { id: 'coaches' as EditorTab, label: 'Staff', icon: Briefcase, count: coaches.length },
    { id: 'schedule' as EditorTab, label: 'Schedule', icon: Calendar, count: matches.length },
    { id: 'standings' as EditorTab, label: 'Standings', icon: Trophy },
    { id: 'team' as EditorTab, label: 'Team Info', icon: ShieldCheck },
    { id: 'media' as EditorTab, label: 'Media', icon: Camera },
    { id: 'import_export' as EditorTab, label: 'Import / Export', icon: Sliders },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#070b14] border border-slate-200 dark:border-blue-900/50 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#080d17] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-condensed font-black text-xl sm:text-2xl uppercase tracking-wide text-slate-900 dark:text-white">
                Team Management Suite
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live database editor for <strong className="text-slate-700 dark:text-slate-200">{teamInfo.teamName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {notification && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 text-xs font-bold border border-emerald-800/80 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-xs">{notification}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Close Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 bg-slate-100 dark:bg-[#060a12] border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification Toast for Mobile / Small Screens */}
        {notification && (
          <div className="md:hidden px-4 py-2 bg-emerald-950 text-emerald-300 text-xs font-bold border-b border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Active Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#080d17]">
          {activeTab === 'players' && (
            <PlayerEditorTab
              players={players}
              onSavePlayers={onSavePlayers}
              showNotification={showNotification}
              initialEditingPlayer={initialEditingPlayer}
              onOpenSyncTab={() => setActiveTab('import_export')}
            />
          )}

          {activeTab === 'coaches' && (
            <CoachEditorTab
              coaches={coaches}
              onSaveCoaches={onSaveCoaches}
              showNotification={showNotification}
              initialEditingCoach={initialEditingCoach}
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

        {/* Bottom Footer Bar */}
        <div className="p-4 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Roster: <strong className="text-slate-900 dark:text-white">{players.length}</strong> Players</span>
            <span>•</span>
            <span>Staff: <strong className="text-slate-900 dark:text-white">{coaches.length}</strong></span>
            <span>•</span>
            <span>Matches: <strong className="text-slate-900 dark:text-white">{matches.length}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Close Suite
          </button>
        </div>
      </div>
    </div>
  );
};
