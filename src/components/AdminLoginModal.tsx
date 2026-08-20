import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ClubCrest } from './ClubCrest';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AUTH_USERNAME = 'daf2011gecnl';
const AUTH_PASSWORD = '#Winning!';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const cleanUser = username.trim();
    const cleanPass = password; // Preserve exact characters in password

    if (cleanUser === AUTH_USERNAME && cleanPass === AUTH_PASSWORD) {
      sessionStorage.setItem('daf_team_editor_auth', 'authenticated');
      setIsSubmitting(false);
      setUsername('');
      setPassword('');
      onSuccess();
    } else {
      setIsSubmitting(false);
      setError('Invalid username or password. Access is restricted to authorized coaching staff.');
    }
  };

  return (
    <div
      id="admin-login-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        id="admin-login-card"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-[#131b2e] to-[#0b101d] border-b border-slate-200 dark:border-slate-800 text-center">
          <button
            id="admin-login-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <ClubCrest size="md" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[#00ADEF] text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Restricted</span>
          </div>

          <h3 className="font-condensed font-black text-2xl uppercase tracking-wider text-slate-900 dark:text-white">
            Team Editor Portal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Authorized access for De Anza Force coaching staff and team managers.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <input
              id="admin-username-input"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter staff username"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00ADEF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#00ADEF] transition-colors"
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 dark:text-slate-300 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-[#00ADEF] hover:from-blue-500 hover:to-[#33beff] text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In & Launch Editor'}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              id="admin-login-cancel-btn"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-500 dark:text-slate-400 transition-colors"
            >
              Cancel & Return to Public Site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
