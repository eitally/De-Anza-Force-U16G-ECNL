import React, { useState } from 'react';
import type { TeamInfo } from '../../types';
import { TeamPhotoManager } from '../TeamPhotoManager';
import { Save, Shield, Bell } from 'lucide-react';

interface TeamInfoEditorTabProps {
  teamInfo: TeamInfo;
  onSaveTeamInfo: (info: TeamInfo) => void;
  showNotification: (msg: string) => void;
}

export const TeamInfoEditorTab: React.FC<TeamInfoEditorTabProps> = ({
  teamInfo,
  onSaveTeamInfo,
  showNotification,
}) => {
  const [localInfo, setLocalInfo] = useState<TeamInfo>(teamInfo);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setLocalInfo(teamInfo);
  }, [teamInfo]);

  const handleUpdate = <K extends keyof TeamInfo>(field: K, val: TeamInfo[K]) => {
    setLocalInfo(prev => ({ ...prev, [field]: val }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSaveTeamInfo(localInfo);
    setHasChanges(false);
    showNotification('✓ Team settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white mb-1">
            Team Identity & Facility Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure club branding, home stadium address, squad photos, and top announcement banner.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-condensed font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all ${
            hasChanges
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{hasChanges ? 'Save Changes *' : 'Save Team Info'}</span>
        </button>
      </div>

      {/* Main Info */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Club & Team Name</label>
          <input
            type="text"
            value={localInfo.teamName}
            onChange={e => handleUpdate('teamName', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Age Group / Birth Year</label>
          <input
            type="text"
            value={localInfo.ageGroup}
            onChange={e => handleUpdate('ageGroup', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Home Facility</label>
          <input
            type="text"
            value={localInfo.homeFacility}
            onChange={e => handleUpdate('homeFacility', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Facility Address</label>
          <input
            type="text"
            value={localInfo.facilityAddress}
            onChange={e => handleUpdate('facilityAddress', e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Recruitment Hub Toggle */}
        <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <label className="block text-slate-900 dark:text-white font-bold mb-0.5">Show College Recruitment Hub</label>
            <p className="text-xs text-slate-500 dark:text-slate-400">Display recruitment information and scout packet downloads.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={localInfo.showRecruitmentHub !== false}
              onChange={e => handleUpdate('showRecruitmentHub', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Squad Photo Manager */}
        <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <TeamPhotoManager
            currentPhotoUrl={localInfo.teamPhotoUrl}
            currentCaption={localInfo.teamPhotoCaption}
            onUpdate={(url, caption) => {
              const updated = {
                ...localInfo,
                teamPhotoUrl: url,
                teamPhotoCaption: caption || localInfo.teamPhotoCaption,
              };
              setLocalInfo(updated);
              onSaveTeamInfo(updated);
              showNotification('✓ Updated official squad photo!');
            }}
            onRemove={() => {
              const updated = {
                ...localInfo,
                teamPhotoUrl: '',
              };
              setLocalInfo(updated);
              onSaveTeamInfo(updated);
              showNotification('✓ Removed team squad photo.');
            }}
            onRestoreDefault={() => {
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
            }}
          />
        </div>
      </div>

      {/* Announcement Notification Banner */}
      <div>
        <h4 className="font-condensed font-black text-lg uppercase text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <span>Top Announcement Notification Banner</span>
        </h4>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show_announcement_tab"
              checked={localInfo.announcement?.show ?? true}
              onChange={e => {
                setLocalInfo(prev => ({
                  ...prev,
                  announcement: {
                    ...prev.announcement,
                    show: e.target.checked,
                    badge: prev.announcement?.badge || 'ECNL NORCAL 2026-27',
                    text: prev.announcement?.text || '',
                  }
                }));
                setHasChanges(true);
              }}
              className="rounded text-blue-600 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="show_announcement_tab" className="text-slate-900 dark:text-white font-bold cursor-pointer">
              Display Announcement Banner at Top of Website
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-500 font-bold block mb-1">Badge Text</label>
              <input
                type="text"
                value={localInfo.announcement?.badge || ''}
                onChange={e => {
                  setLocalInfo(prev => ({
                    ...prev,
                    announcement: {
                      ...prev.announcement,
                      show: prev.announcement?.show ?? true,
                      text: prev.announcement?.text || '',
                      badge: e.target.value,
                    }
                  }));
                  setHasChanges(true);
                }}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-500 font-bold block mb-1">Announcement Message</label>
              <input
                type="text"
                value={localInfo.announcement?.text || ''}
                onChange={e => {
                  setLocalInfo(prev => ({
                    ...prev,
                    announcement: {
                      ...prev.announcement,
                      show: prev.announcement?.show ?? true,
                      badge: prev.announcement?.badge || '',
                      text: e.target.value,
                    }
                  }));
                  setHasChanges(true);
                }}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
