import React, { useState, useEffect } from 'react';
import { ClubCrest } from './ClubCrest';
import { TeamInfo, Match } from '../types';
import { 
  Users, 
  Calendar, 
  Trophy, 
  LayoutDashboard, 
  GraduationCap, 
  ShieldCheck, 
  Image as ImageIcon, 
  Sliders, 
  FileDown, 
  Menu, 
  X, 
  ChevronRight, 
  Flame, 
  ArrowRight,
  Instagram,
  Share2,
  Moon,
  Sun
} from 'lucide-react';

import { MasterAlbumInfo } from '../types';

interface NavbarProps {
  masterAlbumInfo?: MasterAlbumInfo;
  teamInfo: TeamInfo;
  nextMatch?: Match;
  onOpenScoutPack: () => void;
  playerCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  masterAlbumInfo,
  teamInfo,
  nextMatch,
  onOpenScoutPack,
  playerCount,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // default dark
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'De Anza Force 2011G ECNL',
          text: 'Check out the official team & recruiting hub for De Anza Force 2011G ECNL.',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  
  const navLinks = [
    { label: 'Roster', href: '#roster', icon: Users, badge: `${playerCount}` },
    { label: 'Schedule', href: '#schedule', icon: Calendar },
    { label: 'Standings', href: '#standings', icon: Trophy },
    { label: 'Recruiting Hub', href: '#recruiting', icon: GraduationCap },
    { label: 'Staff', href: '#staff', icon: ShieldCheck },
  ];

  const mediaHubUrl = masterAlbumInfo?.url || 'https://linktr.ee/willow_glen_photography';
  
  navLinks.push({ label: 'Media Hub', href: mediaHubUrl, icon: ImageIcon, isExternal: true });


  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* Main Bar */}
      <nav
        className={`w-full border-b transition-all duration-300 ${
          scrolled
            ? 'bg-white dark:bg-[#080c14]/95 backdrop-blur-md border-slate-200 dark:border-slate-800/80 shadow-2xl py-2.5'
            : 'bg-white dark:bg-[#080c14]/85 backdrop-blur-sm border-slate-200 dark:border-slate-800/50 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand Logo & Crest */}
          <a href="#" className="flex items-center gap-3 group">
            <ClubCrest size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-condensed font-black text-xl sm:text-2xl tracking-wide uppercase text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors">
                  DE ANZA FORCE
                </span>
                <span className="hidden md:inline-flex px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#00ADEF]/20 text-[#00ADEF] border border-[#00ADEF]/30">
                  U16 ECNL
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase -mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                ECNL Girls National Team
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                {item.label}
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-600/30 text-blue-400 border border-blue-500/40">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
                      {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/80 transition-all shadow-sm group"
              title="Toggle Light/Dark Mode"
              aria-label="Toggle Theme"
            >
              {isDarkTheme ? (
                <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 group-hover:text-blue-500 transition-colors" />
              )}
            </button>

            {/* Share Page Link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/80 transition-all shadow-sm group"
              title="Share Recruiting Hub"
              aria-label="Share Link"
            >
              <Share2 className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </button>

            {/* Instagram Page Link */}
            <a
              href="https://www.instagram.com/deanzaforce_2011g_ecnl/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-gradient-to-tr hover:from-purple-600 hover:via-rose-600 hover:to-amber-500 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700/80 transition-all shadow-sm group"
              title="Follow @deanzaforce_2011g_ecnl on Instagram"
              aria-label="Instagram Page"
            >
              <Instagram className="w-4 h-4 text-pink-400 group-hover:text-slate-900 dark:hover:text-white transition-colors" />
            </a>

            {/* Scouting PDF Export Button */}
            <button
              onClick={onOpenScoutPack}
              id="nav-scout-pack-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-[#00ADEF] hover:from-blue-500 hover:to-[#33beff] border border-blue-400/40 transition-all shadow-md shadow-blue-950/40 group active:scale-95 cursor-pointer"
              title="Generate printable scouting roster sheet for college coaches"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
              <span>Scout Packet</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-700/60 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080c14]/98 px-4 pt-3 pb-6 mt-2 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-950/40 hover:border-blue-700/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-black text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenScoutPack();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-[#00ADEF] text-slate-900 dark:text-white shadow-lg shadow-blue-900/40"
              >
                <FileDown className="w-4 h-4 text-slate-900 dark:text-white" />
                Download / Print Scout Roster
              </button>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleShare();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 transition-colors"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                Share Recruiting Hub Link
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-[#00ADEF]/50 rounded-lg shadow-xl shadow-[#00ADEF]/10 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#00ADEF]" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </header>
  );
};
