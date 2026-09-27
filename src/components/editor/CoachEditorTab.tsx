import React, { useState } from 'react';
import type { Coach } from '../../types';
import { 
  getSafeImageSrc, 
  handleImageError, 
  DEFAULT_COACH_PHOTO 
} from '../../utils/imageUtils';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Briefcase, 
  Award, 
  Mail, 
  Phone 
} from 'lucide-react';

interface CoachEditorTabProps {
  coaches: Coach[];
  onSaveCoaches: (coaches: Coach[]) => void;
  showNotification: (msg: string) => void;
  initialEditingCoach?: Coach | null;
}

export const CoachEditorTab: React.FC<CoachEditorTabProps> = ({
  coaches,
  onSaveCoaches,
  showNotification,
  initialEditingCoach,
}) => {
  const [editingCoach, setEditingCoach] = useState<Coach | null>(initialEditingCoach || null);
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);
  const [coachPendingDelete, setCoachPendingDelete] = useState<Coach | null>(null);

  const startCreating = () => {
    setIsCreatingCoach(true);
    setEditingCoach({
      id: `c_${Date.now()}`,
      name: '',
      role: 'Assistant Coach',
      license: 'USSF National License',
      experience: '10+ Years Elite Youth Soccer',
      email: '',
      phone: '',
      photoUrl: DEFAULT_COACH_PHOTO,
      bio: '',
      almaMater: '',
    });
  };

  const startEditing = (coach: Coach) => {
    setEditingCoach({ ...coach });
    setIsCreatingCoach(false);
  };

  const cancelEditing = () => {
    setEditingCoach(null);
    setIsCreatingCoach(false);
  };

  const handleSaveCoachForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;

    let updated: Coach[];
    if (isCreatingCoach) {
      const newCoach = { ...editingCoach, id: editingCoach.id || `c_${Date.now()}` };
      updated = [...coaches, newCoach];
      showNotification(`✓ Added ${newCoach.name} to coaching staff!`);
    } else {
      updated = coaches.map(c => (c.id === editingCoach.id ? editingCoach : c));
      showNotification(`✓ Updated profile for ${editingCoach.name}!`);
    }

    onSaveCoaches(updated);
    setEditingCoach(null);
    setIsCreatingCoach(false);
  };

  const executeDeleteCoach = (targetCoach: Coach) => {
    const updated = coaches.filter(c => c.id !== targetCoach.id);
    onSaveCoaches(updated);
    if (editingCoach?.id === targetCoach.id) {
      setEditingCoach(null);
    }
    setCoachPendingDelete(null);
    showNotification(`✓ Removed ${targetCoach.name} from coaching staff.`);
  };

  return (
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
              onClick={cancelEditing}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
                onChange={e => setEditingCoach({ ...editingCoach, name: e.target.value })}
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
                onChange={e => setEditingCoach({ ...editingCoach, role: e.target.value })}
                placeholder="e.g. Head Coach"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                {['Head Coach', 'Associate Head Coach', 'Technical Director', 'Recruiting Coordinator', 'Goalkeeper Coach', 'Team Manager'].map(roleOpt => (
                  <button
                    key={roleOpt}
                    type="button"
                    onClick={() => setEditingCoach({ ...editingCoach, role: roleOpt })}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
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
                onChange={e => setEditingCoach({ ...editingCoach, license: e.target.value })}
                placeholder="e.g. USSF A-Senior National License"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Experience & Background</label>
              <input
                type="text"
                value={editingCoach.experience}
                onChange={e => setEditingCoach({ ...editingCoach, experience: e.target.value })}
                placeholder="e.g. 12+ Years Elite Youth Development & ECNL"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={editingCoach.email}
                onChange={e => setEditingCoach({ ...editingCoach, email: e.target.value })}
                placeholder="coach@deanzaforce.org"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Phone Number</label>
              <input
                type="tel"
                value={editingCoach.phone}
                onChange={e => setEditingCoach({ ...editingCoach, phone: e.target.value })}
                placeholder="(408) 555-0142"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Alma Mater / Club Position</label>
              <input
                type="text"
                value={editingCoach.almaMater || ''}
                onChange={e => setEditingCoach({ ...editingCoach, almaMater: e.target.value })}
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
                  onChange={e => setEditingCoach({ ...editingCoach, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
                />
                <img
                  src={getSafeImageSrc(editingCoach.photoUrl, DEFAULT_COACH_PHOTO)}
                  alt={editingCoach.name || 'Preview'}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shrink-0"
                  onError={e => handleImageError(e, DEFAULT_COACH_PHOTO)}
                />
              </div>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Biography & Coaching Philosophy</label>
              <textarea
                rows={3}
                value={editingCoach.bio}
                onChange={e => setEditingCoach({ ...editingCoach, bio: e.target.value })}
                placeholder="Describe coaching background, achievements, collegiate experience..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            {!isCreatingCoach && editingCoach ? (
              <button
                type="button"
                onClick={() => setCoachPendingDelete(editingCoach)}
                className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Coach</span>
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
                {isCreatingCoach ? 'Add Staff Member' : 'Apply Coach Edits'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span>Coaching & Technical Staff Roster</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  {coaches.length} Staff
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage head coaches, recruiting directors, goalkeeper specialists, and staff contacts.
              </p>
            </div>

            <button
              type="button"
              onClick={startCreating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Coach / Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches.map(coach => (
              <div
                key={coach.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5 hover:border-blue-500/50 transition-colors"
              >
                <img
                  src={getSafeImageSrc(coach.photoUrl, DEFAULT_COACH_PHOTO)}
                  alt={coach.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                  onError={e => handleImageError(e, DEFAULT_COACH_PHOTO)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {coach.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(coach)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Edit Coach"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoachPendingDelete(coach)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                        title="Delete Coach"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="inline-block text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {coach.role}
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                    {coach.license && (
                      <p className="flex items-center gap-1 truncate">
                        <Award className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{coach.license}</span>
                      </p>
                    )}
                    {coach.email && (
                      <p className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{coach.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal: Delete Coach */}
      {coachPendingDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setCoachPendingDelete(null)}
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
                <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white">Delete Staff Member</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Remove coach from staff roster</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{coachPendingDelete.name}</strong> ({coachPendingDelete.role}) from the staff roster?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCoachPendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeDeleteCoach(coachPendingDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
