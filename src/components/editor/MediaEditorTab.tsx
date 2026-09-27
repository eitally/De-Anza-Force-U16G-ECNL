import React, { useState } from 'react';
import type { TeamInfo } from '../../types';
import { TeamPhotoManager } from '../TeamPhotoManager';
import { Camera, Save } from 'lucide-react';

interface MediaEditorTabProps {
  teamInfo: TeamInfo;
  onSaveTeamInfo: (info: TeamInfo) => void;
  showNotification: (msg: string) => void;
}

export const MediaEditorTab: React.FC<MediaEditorTabProps> = ({
  teamInfo,
  onSaveTeamInfo,
  showNotification,
}) => {
  const [localInfo, setLocalInfo] = useState<TeamInfo>(teamInfo);

  React.useEffect(() => {
    setLocalInfo(teamInfo);
  }, [teamInfo]);

  const handleUpdatePhoto = (url: string, caption?: string) => {
    const updated = {
      ...localInfo,
      teamPhotoUrl: url,
      teamPhotoCaption: caption || localInfo.teamPhotoCaption,
    };
    setLocalInfo(updated);
    onSaveTeamInfo(updated);
    showNotification('✓ Updated official squad photo!');
  };

  const handleRemovePhoto = () => {
    const updated = {
      ...localInfo,
      teamPhotoUrl: '',
    };
    setLocalInfo(updated);
    onSaveTeamInfo(updated);
    showNotification('✓ Removed team squad photo.');
  };

  const handleRestoreDefault = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=80';
    const defaultCaption = '2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff';
    const updated = {
      ...localInfo,
      teamPhotoUrl: defaultUrl,
      teamPhotoCaption: defaultCaption,
    };
    setLocalInfo(updated);
    onSaveTeamInfo(updated);
    showNotification('✓ Restored default squad photo.');
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[#00ADEF] shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white font-condensed tracking-wider">
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
          currentPhotoUrl={localInfo.teamPhotoUrl}
          currentCaption={localInfo.teamPhotoCaption}
          onUpdate={handleUpdatePhoto}
          onRemove={handleRemovePhoto}
          onRestoreDefault={handleRestoreDefault}
        />
      </div>
    </div>
  );
};
