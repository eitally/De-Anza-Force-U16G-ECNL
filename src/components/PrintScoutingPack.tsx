import React, { useState } from 'react';
import { Player, TeamInfo, Coach } from '../types';
import { ClubCrest } from './ClubCrest';
import { getValidDocumentUrl } from '../utils/urlUtils';
import { Printer, X, ArrowRight, Edit3, Check } from 'lucide-react';

interface PrintScoutingPackProps {
  isOpen: boolean;
  onClose: () => void;
  teamInfo: TeamInfo;
  players: Player[];
  coaches: Coach[];
  onTogglePlayerScouting?: (playerId: string, include: boolean) => void;
}

export const PrintScoutingPack: React.FC<PrintScoutingPackProps> = ({
  isOpen,
  onClose,
  teamInfo,
  players,
  coaches,
  onTogglePlayerScouting,
}) => {
  const [tournamentTitle, setTournamentTitle] = useState('SCOUTING ROSTER');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  if (!isOpen) return null;

  // Filter out any retired players just in case
  const activePlayers = players.filter(p => {
    const n = (p.name || '').toLowerCase();
    return !n.includes('parker') && !n.includes('sasha') && !n.includes('anava');
  });

  // Find Paul Bravo and Yuta Tanaka
  const paulBravo = coaches?.find(c => c.name.toLowerCase().includes('bravo')) || {
    name: 'Paul Bravo',
    role: 'Head Coach',
    email: 'paulgbravo9@gmail.com',
    phone: '(720) 475-6991',
    photoUrl: 'https://i.imgur.com/c0qeiY4.png'
  };

  const yutaTanaka = coaches?.find(c => c.name.toLowerCase().includes('yuta') || c.name.toLowerCase().includes('tanaka')) || {
    name: 'Yuta Tanaka',
    role: 'Strength & Agility Coach',
    email: 'yuta.tanaka@gmail.com',
    phone: '(650) 619-3670',
    photoUrl: 'https://i.imgur.com/iNiPnJD.jpeg'
  };

  // Helper to format position using the specific player position listed in the roster (e.g. "Attacking Midfielder (#10)")
  const getPlayerPosition = (player: Player) => {
    if (player.specificPosition && player.specificPosition.trim() !== '') {
      return player.specificPosition.trim();
    }
    if (player.primaryPosition && player.primaryPosition.trim() !== '') {
      return player.primaryPosition.trim();
    }
    return 'Player';
  };

  const isGoalkeeper = (p: Player) => {
    const pri = (p.primaryPosition || '').toLowerCase();
    const spec = (p.specificPosition || '').toLowerCase();
    return pri.includes('goal') || pri.includes('gk') || spec.includes('goalkeeper') || spec.includes('keeper') || spec.includes('(gk)');
  };

  // Put all goalkeepers first in the list, regardless of their jersey number, then sort by jersey number
  const sortedPlayers = [...activePlayers].sort((a, b) => {
    const aGK = isGoalkeeper(a);
    const bGK = isGoalkeeper(b);
    if (aGK && !bGK) return -1;
    if (!aGK && bGK) return 1;
    const aNum = Number(a.jerseyNumber) || 999;
    const bNum = Number(b.jerseyNumber) || 999;
    if (aNum !== bNum) return aNum - bNum;
    return a.name.localeCompare(b.name);
  });

  // Page 1 gets all active scouted players (excluding alternates where includeInScoutingPack === false)
  const activeScoutingPlayers = sortedPlayers.filter(p => p.includeInScoutingPack !== false);
  const page1Players = activeScoutingPlayers;
  // Bifold Inside Spread: Split squad evenly into Left Spread and Right Spread
  const halfCount = Math.ceil(page1Players.length / 2);
  const leftSpreadPlayers = page1Players.slice(0, halfCount);
  const rightSpreadPlayers = page1Players.slice(halfCount);
  const maxSpreadCount = Math.max(leftSpreadPlayers.length, rightSpreadPlayers.length);
  const gridRowCount = maxSpreadCount > 12 ? 5 : 4;

  // Page 2 is program cover & staff/notes
  const page2Players: Player[] = [];
  // Page 3 is not needed as all squad members fit on Page 1
  const page3Players: Player[] = [];

  const websiteUrl = 'https://www.deanzaforce2011g.com/';
  const teamBrochureQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(websiteUrl)}`;
  const currentYear = new Date().getFullYear();

  const handlePrint = () => {
    window.print();
  };

  // Single Player Card matching bifold specifications
  const renderPlayerCard = (player: Player) => {
    const validDocUrl = getValidDocumentUrl(player);
    const profileUrl = validDocUrl || player.highlightsUrl || '#';
    const qrTarget =
      validDocUrl ||
      player.highlightsUrl ||
      (typeof window !== 'undefined' ? `${window.location.origin}/#roster?player=${player.id}` : 'https://www.deanzaforce2011g.com/');
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrTarget)}`;
    const position = getPlayerPosition(player);
    const gpaDisplay = player.gpa && player.gpa.trim() !== '' && player.gpa.toLowerCase() !== 'na' && player.gpa.toLowerCase() !== 'n/a' ? player.gpa : 'NA';
    const heightDisplay = player.height && player.height.trim() !== '' ? player.height : '5\'6"';

    const playerPhoto = player.photoUrl || '';
    const hasHeadshot = Boolean(
      playerPhoto &&
      playerPhoto.trim() !== '' &&
      !playerPhoto.includes('c0qeiY4') &&
      !playerPhoto.includes('daf-crest') &&
      !playerPhoto.includes('logo.png')
    );

    return (
      <div 
        key={player.id}
        className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative p-1.5 print:p-1 transition-all hover:border-slate-300 print:shadow-none print:border-slate-300 h-full min-h-0"
      >
        {/* Top Header Row: #Jersey Number on left + QR code on right */}
        <div className="flex items-start justify-between z-10 shrink-0">
          <span className="font-sans font-black text-lg sm:text-xl print:text-base text-slate-950 leading-none select-none tracking-tight">
            #{player.jerseyNumber}
          </span>
          
          <a
            href={profileUrl !== '#' ? profileUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            title={`Scan or click to view ${player.name}'s profile flyer`}
            className="shrink-0 group/qr"
          >
            <img
              src={qrCodeUrl}
              alt={`QR code for ${player.name}`}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 print:w-7.5 print:h-7.5 border border-slate-300 rounded bg-white p-0.5 shadow-xs group-hover/qr:scale-105 transition-transform"
              loading="lazy"
            />
          </a>
        </div>

        {/* Center: Large Centered Headshot (NO frame, fade to white at bottom) */}
        <div className="relative -mt-3 sm:-mt-3.5 flex items-center justify-center my-auto">
          {hasHeadshot ? (
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 print:w-[86px] print:h-[86px] flex items-center justify-center overflow-hidden">
              <img
                src={playerPhoto}
                alt={player.name}
                className="w-full h-full object-cover object-top select-none pointer-events-none"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.className = 'w-16 h-16 flex items-center justify-center p-0.5';
                  }
                }}
              />
              {/* Soft fade to white at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
            </div>
          ) : (
            /* Clean De Anza Force Logo (NO frame, centered) */
            <div className="w-18 h-18 sm:w-20 sm:h-20 print:w-16 print:h-16 flex items-center justify-center p-0.5">
              <img 
                src="/logo.png" 
                alt="De Anza Force" 
                className="w-full h-full object-contain pointer-events-none select-none border-0 shadow-none" 
              />
            </div>
          )}
        </div>

        {/* Bottom Section: Text Moved Down */}
        <div className="text-center flex flex-col justify-end mt-auto pt-0.5 min-w-0">
          <h4 className="font-sans font-black text-[11px] print:text-[9.5px] uppercase tracking-tight text-slate-950 leading-tight truncate px-0.5" title={player.name}>
            {player.name}
          </h4>
          <div className="font-bold text-[8.5px] print:text-[7.5px] uppercase tracking-tight text-[#00ADEF] leading-tight truncate mt-0.5" title={position}>
            {position}
          </div>
          <div className="text-[7.5px] print:text-[7px] text-slate-700 font-semibold leading-tight mt-0.5 flex items-center justify-center gap-1 truncate">
            <span>Ht: {heightDisplay}</span>
            <span>•</span>
            <span>GPA: {gpaDisplay}</span>
            <span>•</span>
            <span>'{String(player.gradYear || 2029).slice(-2)}</span>
          </div>
          <div className="pt-0.5 min-w-0">
            <a
              href={`mailto:${player.contactEmail}`}
              className="text-[7.5px] print:text-[6.5px] text-sky-800 hover:text-sky-600 font-medium truncate block leading-tight hover:underline text-center"
              title={player.contactEmail}
            >
              {player.contactEmail || 'info@deanzaforce.org'}
            </a>
            <div className="h-0.5 bg-[#00ADEF] w-full mt-0.5 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md print-scouting-pack"
    >
      <div 
        className="relative w-full max-w-[1240px] rounded-2xl bg-slate-100 text-slate-900 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none print:bg-white print:overflow-visible print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-3 sm:p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00ADEF]/15 flex items-center justify-center text-[#00ADEF]">
              <ClubCrest size="sm" showText={false} />
            </div>
            <div>
              <span className="font-condensed font-black text-base sm:text-lg uppercase tracking-wider block leading-tight">
                Official College Coach Scouting Pack
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                2-Page Landscape Format • ECNL Showcase & College Recruitment Standard
              </span>
            </div>
          </div>

          {/* Center: Title customizer */}
          <div className="flex items-center gap-2">
            {/* Generic Title Editor */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[11px] text-slate-400">Roster Title:</span>
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tournamentTitle}
                    onChange={(e) => setTournamentTitle(e.target.value.toUpperCase())}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-[#00ADEF]"
                    placeholder="TEAM ROSTER"
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="p-1 hover:text-[#00ADEF]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-[#00ADEF] flex items-center gap-1"
                  title="Click to customize roster or tournament title"
                >
                  <span>{tournamentTitle}</span>
                  <Edit3 className="w-3 h-3 text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00ADEF] hover:bg-[#0098d3] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-6 overflow-y-auto print:overflow-visible print:p-0 flex-1">
          <div className="flex flex-col gap-8 print:gap-0">
              
              {/* ========================================================= */}
              {/* PAGE 1: INSIDE BIFOLD SPREAD (LEFT SPREAD | FOLD GAP | RIGHT SPREAD) */}
              {/* ========================================================= */}
              <div 
                className="bg-white text-slate-900 w-full rounded-xl shadow-lg border border-slate-300/80 p-2 sm:p-3 flex flex-col justify-between print:rounded-none print:shadow-none print:border-none print:p-1.5 print-page-break min-h-[660px]"
              >
                  {/* Compact Header for Page 1 */}
                  <div className="border-b-2 border-slate-950 pb-1.5 mb-1.5 flex items-center justify-between print:pb-1 print:mb-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-8 print:w-6 print:h-7 shrink-0">
                        <img src="/logo.png" alt="De Anza Force" className="w-full h-full object-contain pointer-events-none select-none" />
                      </div>
                      <div>
                        <h3 className="font-condensed font-black text-base sm:text-lg print:text-sm uppercase tracking-tight text-slate-950 leading-none">
                          DE ANZA FORCE U16G ECNL - 2010/2011 • {tournamentTitle}
                        </h3>
                        <p className="text-[9.5px] print:text-[8px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                          College Showcase &amp; Scouting Roster • Head Coach: {paulBravo.name} ({paulBravo.phone})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <a
                        href="https://deanzaforce2011g.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-condensed font-black text-xs sm:text-sm print:text-xs text-[#00ADEF] hover:underline uppercase tracking-tight block leading-none"
                      >
                        https://deanzaforce2011g.com
                      </a>
                    </div>
                  </div>

                  {/* Bifold 2-Page Inside Spread with Center Folding Gap */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 print:grid-cols-2 print:gap-6 flex-1 relative">
                    
                    {/* Visual Center Fold Crease Guideline (print-friendly) */}
                    <div className="hidden print:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-r border-dashed border-slate-300 pointer-events-none" />

                    {/* INSIDE LEFT PANEL (First Half of Squad) */}
                    <div className="flex flex-col justify-between md:pr-1.5 print:pr-1 h-full">
                      <div 
                        className="grid grid-cols-3 gap-1 sm:gap-1.5 print:grid-cols-3 print:gap-1 flex-1"
                        style={{ gridTemplateRows: `repeat(${gridRowCount}, minmax(0, 1fr))` }}
                      >
                        {leftSpreadPlayers.map((player) => renderPlayerCard(player))}
                      </div>
                    </div>

                    {/* INSIDE RIGHT PANEL (Second Half of Squad) */}
                    <div className="flex flex-col justify-between md:pl-1.5 print:pl-1 h-full">
                      <div 
                        className="grid grid-cols-3 gap-1 sm:gap-1.5 print:grid-cols-3 print:gap-1 flex-1"
                        style={{ gridTemplateRows: `repeat(${gridRowCount}, minmax(0, 1fr))` }}
                      >
                        {rightSpreadPlayers.map((player) => renderPlayerCard(player))}
                      </div>
                    </div>

                  </div>
                </div>

              {/* ========================================================= */}
              {/* PAGE 2: OUTSIDE BIFOLD SPREAD (BACK COVER & FRONT COVER)  */}
              {/* ========================================================= */}
              <div 
                className="bg-white text-slate-900 w-full rounded-xl shadow-lg border border-slate-300/80 p-2 sm:p-3 flex flex-col justify-between print:rounded-none print:shadow-none print:border-none print:p-1.5 print-page-break min-h-[660px]"
              >
                  {/* Bifold 2-Panel Spread matching Page 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 print:grid-cols-2 print:gap-6 flex-1 relative">
                    
                    {/* Visual Center Fold Crease Guideline (print-friendly) */}
                    <div className="hidden print:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-r border-dashed border-slate-300 pointer-events-none" />

                    {/* OUTSIDE LEFT PANEL: De Anza Force Card, Paul Bravo, Yuta Tanaka, & Scout Notes */}
                    <div className="flex flex-col justify-between md:pr-1.5 print:pr-1">
                      
                      {/* Top Row: 3 Compact Shrunk Boxes (Team Profile + 2 Coaches) */}
                      {/* Top Row: 3 Compact Shrunk Boxes (Team Profile + 2 Coaches - NO PHOTOS) */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 print:gap-1.5 shrink-0">
                        
                        {/* 1. Team Profile Box (Matching compact height) */}
                        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative p-1.5 print:p-1 print:shadow-none print:border-slate-300 min-h-[72px] max-h-[86px]">
                          <div className="flex items-center justify-between">
                            <span className="font-condensed font-black text-[9px] print:text-[8.5px] text-slate-950 uppercase tracking-wider truncate">
                              DE ANZA FORCE
                            </span>
                            <span className="text-[6.5px] print:text-[6px] font-bold text-[#00ADEF] uppercase tracking-wider shrink-0">
                              NORCAL ECNL
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 my-auto py-0.5">
                            <div className="w-6 h-7 print:w-5.5 print:h-6.5 shrink-0 flex items-center justify-center">
                              <img src="/logo.png" alt="De Anza Force" className="w-full h-full object-contain pointer-events-none select-none" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-condensed font-black text-[9px] print:text-[8px] uppercase text-slate-950 leading-tight truncate">
                                U16G ECNL - 2010/2011
                              </h5>
                              <p className="text-[6.5px] print:text-[6px] text-slate-600 font-semibold leading-tight mt-0.5 truncate">
                                Silicon Valley, CA
                              </p>
                            </div>
                          </div>

                          <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between min-w-0">
                            <a
                              href="https://deanzaforce2011g.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[6.5px] print:text-[6px] text-sky-800 hover:text-sky-600 font-semibold truncate hover:underline"
                            >
                              deanzaforce2011g.com
                            </a>
                            <div className="h-0.5 bg-[#00ADEF] w-10 rounded-full"></div>
                          </div>
                        </div>

                        {/* 2. Coach Box: Paul Bravo (NO PHOTO - Compact Info Card) */}
                        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative p-1.5 print:p-1 print:shadow-none print:border-slate-300 min-h-[72px] max-h-[86px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[7.5px] print:text-[7px] uppercase tracking-wider text-[#00ADEF] leading-tight truncate">
                              HEAD COACH • ECNL DIR
                            </span>
                            <span className="text-[6.5px] print:text-[6px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                              STAFF
                            </span>
                          </div>

                          <div className="my-auto py-0.5 min-w-0">
                            <h4 className="font-sans font-black text-[10.5px] print:text-[9.5px] uppercase tracking-tight text-slate-950 leading-tight truncate">
                              {paulBravo.name}
                            </h4>
                            <div className="text-[7.5px] print:text-[7px] text-slate-950 font-bold leading-tight mt-0.5 truncate">
                              {paulBravo.phone || '(720) 475-6991'}
                            </div>
                          </div>

                          <div className="pt-0.5 border-t border-slate-100 min-w-0">
                            <a
                              href={`mailto:${paulBravo.email || 'paulgbravo9@gmail.com'}`}
                              className="text-[7px] print:text-[6.5px] text-sky-800 hover:text-sky-600 font-medium truncate block leading-tight hover:underline"
                              title={paulBravo.email}
                            >
                              {paulBravo.email || 'paulgbravo9@gmail.com'}
                            </a>
                            <div className="h-0.5 bg-[#00ADEF] w-full mt-0.5 rounded-full"></div>
                          </div>
                        </div>

                        {/* 3. Coach Box: Yuta Tanaka (NO PHOTO - Compact Info Card) */}
                        <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative p-1.5 print:p-1 print:shadow-none print:border-slate-300 min-h-[72px] max-h-[86px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[7.5px] print:text-[7px] uppercase tracking-wider text-[#00ADEF] leading-tight truncate">
                              STRENGTH &amp; AGILITY COACH
                            </span>
                            <span className="text-[6.5px] print:text-[6px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                              STAFF
                            </span>
                          </div>

                          <div className="my-auto py-0.5 min-w-0">
                            <h4 className="font-sans font-black text-[10.5px] print:text-[9.5px] uppercase tracking-tight text-slate-950 leading-tight truncate">
                              {yutaTanaka.name}
                            </h4>
                            <div className="text-[7.5px] print:text-[7px] text-slate-950 font-bold leading-tight mt-0.5 truncate">
                              {yutaTanaka.phone || '(650) 619-3670'}
                            </div>
                          </div>

                          <div className="pt-0.5 border-t border-slate-100 min-w-0">
                            <a
                              href={`mailto:${yutaTanaka.email || 'yuta.tanaka@gmail.com'}`}
                              className="text-[7px] print:text-[6.5px] text-sky-800 hover:text-sky-600 font-medium truncate block leading-tight hover:underline"
                              title={yutaTanaka.email}
                            >
                              {yutaTanaka.email || 'yuta.tanaka@gmail.com'}
                            </a>
                            <div className="h-0.5 bg-[#00ADEF] w-full mt-0.5 rounded-full"></div>
                          </div>
                        </div>

                      </div>

                      {/* Dedicated Lined Scout Notes Section (Uses all available space on Page 2) */}
                      <div className="mt-2.5 pt-1.5 flex-1 flex flex-col min-h-0">
                        {/* Cyan Top Line */}
                        <div className="h-0.5 bg-[#00ADEF] w-full mb-1 shrink-0"></div>
                        
                        <div className="flex items-center justify-between mb-1 shrink-0">
                          <span className="font-condensed font-black text-sm tracking-wider uppercase text-slate-950">
                            NOTES
                          </span>
                        </div>

                        {/* Ruled Notebook Lines that stretch to use all available height */}
                        <div className="flex-1 flex flex-col justify-between py-1 min-h-[460px] print:min-h-[500px]">
                          {Array.from({ length: 26 }).map((_, i) => (
                            <div key={i} className="border-b border-slate-300/90 w-full h-0"></div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* OUTSIDE RIGHT PANEL: Cover with SCOUTING ROSTER & Digital Team Website QR */}
                    <div className="flex flex-col justify-between md:pl-1.5 print:pl-1">
                      
                      {/* Upper Center: Big Crest with Speed Racing Stripes */}
                      <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6">
                        
                        {/* Crest with Left & Right 3 Horizontal Stripes */}
                        <div className="w-full flex items-center justify-center gap-3 sm:gap-4 max-w-lg mb-4">
                          {/* 3 Black Stripes Left */}
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                          </div>

                          {/* Force Shield Crest */}
                          <div className="w-24 h-28 sm:w-28 sm:h-32 shrink-0">
                            <ClubCrest size="xl" showText={false} className="w-full h-full" />
                          </div>

                          {/* 3 Black Stripes Right */}
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                          </div>
                        </div>

                        {/* Titles */}
                        <h1 className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-slate-950 tracking-tight text-center leading-none">
                          DE ANZA FORCE
                        </h1>

                        <div className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl text-[#00ADEF] tracking-tight text-center leading-none my-1 select-none">
                          U16G ECNL - 2010/2011
                        </div>

                        <h2 className="font-condensed font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider text-slate-950 text-center leading-tight mt-1">
                          SCOUTING ROSTER
                        </h2>

                        <div className="font-condensed font-black text-xl sm:text-2xl text-slate-950 tracking-wider text-center mt-1">
                          {currentYear}
                        </div>
                      </div>

                      {/* Lower Section: Team Website Self-Referential QR Code */}
                      <div className="mt-auto pt-3 border-t border-slate-200">
                        <div className="flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <a
                            href="https://www.deanzaforce2011g.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1.5"
                            title="Scan or click to open the official Team Website (https://www.deanzaforce2011g.com/)"
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.deanzaforce2011g.com/')}`}
                              alt="Team Website QR Code"
                              className="w-16 h-16 sm:w-18 sm:h-18 border-2 border-slate-900 rounded bg-white p-1 shadow-xs group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            <span className="font-condensed font-black text-xs sm:text-sm tracking-wide text-slate-950 font-mono group-hover:text-[#00ADEF] transition-colors">
                              https://www.deanzaforce2011g.com/
                            </span>
                          </a>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

              {/* ========================================================= */}
              {/* PAGE 3: SQUAD RESERVES & EXTENDED ROSTER (IF > 19 PLAYERS) */}
              {/* ========================================================= */}
              {page3Players.length > 0 && (
                <div 
                  className="bg-white text-slate-900 w-full rounded-xl shadow-lg border border-slate-300/80 p-4 sm:p-5 flex flex-col justify-between print:rounded-none print:shadow-none print:border-none print:p-2 print-page-break min-h-[680px]"
                >
                  <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-9 shrink-0">
                        <ClubCrest size="sm" showText={false} />
                      </div>
                      <div>
                        <h3 className="font-condensed font-black text-lg uppercase tracking-tight text-slate-950">
                          De Anza Force U16G ECNL - 2010/2011 • {tournamentTitle}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Squad Reserves &amp; Extended Player Roster ({page3Players.length} Players)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Page 3 of 3
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 flex-1">
                    {page3Players.map((player) => renderPlayerCard(player))}
                  </div>
                </div>
              )}

            </div>

        </div>
      </div>
    </div>
  );
};
