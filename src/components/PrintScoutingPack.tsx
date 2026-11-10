import React, { useState } from 'react';
import { Player, TeamInfo, Coach } from '../types';
import { ClubCrest } from './ClubCrest';
import { isRemovedPlayer } from '../utils/standingsCron';
import { Printer, X, Edit3, Check } from 'lucide-react';

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
  const [tournamentTitle, setTournamentTitle] = useState('SCOUTING BROCHURE');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  if (!isOpen) return null;

  // Filter out any retired/departed players
  const activePlayers = players.filter(p => !isRemovedPlayer(p));

  // Find Paul Bravo, Yuta Tanaka, and Larry Jackson
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

  const larryJackson = coaches?.find(c => c.name.toLowerCase().includes('larry') || c.name.toLowerCase().includes('jackson')) || {
    name: 'Larry Jackson',
    role: 'Goalkeeper Coach',
    email: 'Larry.Jackson@deanzaforce.org',
    phone: '',
    photoUrl: 'https://i.imgur.com/c0qeiY4.png'
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
    const aNum = a.jerseyNumber !== undefined && a.jerseyNumber !== null && !isNaN(Number(a.jerseyNumber)) ? Number(a.jerseyNumber) : 999;
    const bNum = b.jerseyNumber !== undefined && b.jerseyNumber !== null && !isNaN(Number(b.jerseyNumber)) ? Number(b.jerseyNumber) : 999;
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
    const previousTitle = document.title;
    document.title = 'De Anza Force U16G ECNL - Scouting Brochure';
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 500);
  };

  // Single Player Card matching bifold specifications
  const renderPlayerCard = (player: Player) => {
    const playerKey = encodeURIComponent(String(player.jerseyNumber ?? player.id));
    const permanentRedirectUrl = `https://www.deanzaforce2011g.com/?profile=${playerKey}`;
    const qrTarget = permanentRedirectUrl;
    const profileUrl = permanentRedirectUrl;
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
        className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative px-1.5 pb-1 pt-0 print:px-1 print:pb-1 print:pt-0 transition-all hover:border-slate-300 print:shadow-none print:border-slate-300 h-full min-h-0"
      >
        {/* Upper Region: Full-Height 4:5 Portrait Headshot Reaching Down to Name + Overlaid #Jersey & QR Code */}
        <div className="relative flex-1 w-full min-h-[114px] sm:min-h-[122px] print:min-h-[108px]">
          {/* Top-Aligned Full-Height Centered Headshot (Flush with Top, reaches all the way down to player name) */}
          <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-0 overflow-hidden">
            {hasHeadshot ? (
              <div className="relative h-full w-full flex items-start justify-center overflow-hidden">
                <img
                  src={playerPhoto}
                  alt={player.name}
                  className="h-full w-auto max-w-full aspect-[4/5] object-cover object-top select-none pointer-events-none"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.className = 'w-20 h-20 flex items-center justify-center p-1 mt-1';
                    }
                  }}
                />
              </div>
            ) : (
              /* Clean De Anza Force Logo (NO frame, centered) */
              <div className="w-20 h-20 sm:w-22 sm:h-22 print:w-18 print:h-18 flex items-center justify-center p-1 mt-1">
                <img 
                  src="/logo.png" 
                  alt="De Anza Force" 
                  className="w-full h-full object-contain pointer-events-none select-none border-0 shadow-none" 
                />
              </div>
            )}
          </div>

          {/* Top Header Row: Overlaid #Jersey Number + QR code */}
          <div className="relative z-10 flex items-start justify-between pt-1 print:pt-0.5 pointer-events-none">
            <span className="font-sans font-black text-lg sm:text-xl print:text-base text-slate-950 leading-none select-none tracking-tight">
              #{player.jerseyNumber}
            </span>
            
            <a
              href={profileUrl !== '#' ? profileUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              title={`Scan or click to view ${player.name}'s profile flyer`}
              className="shrink-0 group/qr pointer-events-auto"
            >
              <img
                src={qrCodeUrl}
                alt={`QR code for ${player.name}`}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 print:w-7.5 print:h-7.5 border border-slate-300 rounded bg-white p-0.5 group-hover/qr:scale-105 transition-transform"
                loading="lazy"
              />
            </a>
          </div>
        </div>

        {/* Bottom Section: Player Name & Details */}
        <div className="relative z-10 text-center flex flex-col justify-end mt-auto pt-0.5 min-w-0 bg-white">
          <h4
            className={`font-sans font-black uppercase text-slate-950 leading-[1.08] whitespace-normal break-words px-0.5 ${
              player.name.length > 16 || player.name.split(/\s+/).some(w => w.length > 11)
                ? 'text-[10.5px] sm:text-[11px] print:text-[9.5px] tracking-tighter'
                : 'text-xs sm:text-[12.5px] print:text-[10.5px] tracking-tight'
            }`}
            title={player.name}
          >
            {player.name}
          </h4>
          <div className="font-bold text-[10px] sm:text-[10.5px] print:text-[9px] uppercase tracking-tight text-[#00ADEF] leading-tight truncate mt-0.5" title={position}>
            {position}
          </div>
          <div className="text-[9px] sm:text-[9.5px] print:text-[8.5px] text-slate-700 font-semibold leading-tight mt-0.5 flex items-center justify-center gap-1 truncate">
            <span>Ht: {heightDisplay}</span>
            <span>•</span>
            <span>GPA: {gpaDisplay}</span>
            <span>•</span>
            <span>'{String(player.gradYear || 2029).slice(-2)}</span>
          </div>
          <div className="pt-1 min-w-0">
            <div className="h-0.5 bg-[#00ADEF] w-full rounded-full"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md print-scouting-pack print:static print:block print:p-0 print:m-0"
    >
      <div 
        className="relative w-full max-w-[1240px] rounded-2xl bg-slate-100 text-slate-900 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col print:my-0 print:m-0 print:p-0 print:max-h-none print:shadow-none print:rounded-none print:bg-white print:overflow-visible print:w-full print:max-w-none print:block"
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
                De Anza Force U16G ECNL - Scouting Brochure
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
                className="bg-white text-slate-900 w-full rounded-xl shadow-lg border border-slate-300/80 p-2 sm:p-3 flex flex-col justify-between print:rounded-none print:shadow-none print:border-none print:p-0 print:m-0 print:rotate-180 print-page-break min-h-[700px] print:h-[8in] print:min-h-[8in] print:max-h-[8in]"
              >
                  {/* Compact Header for Page 1 (Flush to Top 1/4" Margin) */}
                  <div className="border-b-2 border-slate-950 pb-1 mb-1 flex items-center justify-between print:pb-0.5 print:mb-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-7 print:w-5.5 print:h-6.5 shrink-0">
                        <img src="/logo.png" alt="De Anza Force" className="w-full h-full object-contain pointer-events-none select-none" />
                      </div>
                      <div>
                        <h3 className="font-condensed font-black text-base sm:text-lg print:text-sm uppercase tracking-tight text-slate-950 leading-none">
                          DE ANZA FORCE U16G ECNL - 2010/2011 • {tournamentTitle}
                        </h3>
                        <p className="text-[9.5px] print:text-[8px] font-bold text-slate-600 uppercase tracking-wider mt-0.5 leading-none">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 print:grid-cols-2 print:gap-5 flex-1 min-h-0 relative">
                    
                    {/* Visual Center Fold Crease Guideline (print-friendly) */}
                    <div className="hidden print:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-r border-dashed border-slate-300 pointer-events-none" />

                    {/* INSIDE LEFT PANEL (First Half of Squad + Bottom Note Lines) */}
                    <div className="flex flex-col justify-between md:pr-1 print:pr-1 h-full min-h-0">
                      <div 
                        className="grid grid-cols-3 gap-1 sm:gap-1.5 print:grid-cols-3 print:gap-1 flex-1 min-h-0"
                        style={{ gridTemplateRows: `repeat(${gridRowCount}, minmax(0, 1fr))` }}
                      >
                        {leftSpreadPlayers.map((player) => renderPlayerCard(player))}
                      </div>

                      {/* Reclaimed Bottom Space: Quick Scout Notes Lines (Left Panel) */}
                      <div className="mt-1.5 pt-1 border-t border-slate-300 shrink-0 space-y-2.5 print:mt-1 print:pt-0.5 print:space-y-2">
                        <div className="flex items-end gap-1.5">
                          <span className="font-condensed font-black text-[9px] uppercase tracking-wider text-slate-700 leading-none shrink-0">
                            Notes:
                          </span>
                          <div className="flex-1 border-b border-slate-300 h-2.5"></div>
                        </div>
                        <div className="border-b border-slate-300 w-full h-2.5"></div>
                        <div className="border-b border-slate-300 w-full h-2.5"></div>
                      </div>
                    </div>

                    {/* INSIDE RIGHT PANEL (Second Half of Squad + Bottom Note Lines) */}
                    <div className="flex flex-col justify-between md:pl-1 print:pl-1 h-full min-h-0">
                      <div 
                        className="grid grid-cols-3 gap-1 sm:gap-1.5 print:grid-cols-3 print:gap-1 flex-1 min-h-0"
                        style={{ gridTemplateRows: `repeat(${gridRowCount}, minmax(0, 1fr))` }}
                      >
                        {rightSpreadPlayers.map((player) => renderPlayerCard(player))}
                      </div>

                      {/* Reclaimed Bottom Space: Quick Scout Notes Lines (Right Panel) */}
                      <div className="mt-1.5 pt-1 border-t border-slate-300 shrink-0 space-y-2.5 print:mt-1 print:pt-0.5 print:space-y-2">
                        <div className="flex items-end gap-1.5">
                          <span className="font-condensed font-black text-[9px] uppercase tracking-wider text-slate-700 leading-none shrink-0">
                            Notes:
                          </span>
                          <div className="flex-1 border-b border-slate-300 h-2.5"></div>
                        </div>
                        <div className="border-b border-slate-300 w-full h-2.5"></div>
                        <div className="border-b border-slate-300 w-full h-2.5"></div>
                      </div>
                    </div>

                  </div>
                </div>

              {/* ========================================================= */}
              {/* PAGE 2: OUTSIDE BIFOLD SPREAD (BACK COVER & FRONT COVER)  */}
              {/* ========================================================= */}
              <div 
                className="bg-white text-slate-900 w-full rounded-xl shadow-lg border border-slate-300/80 p-2 sm:p-3 flex flex-col justify-between print:rounded-none print:shadow-none print:border-none print:p-0 print:m-0 min-h-[700px] print:h-[8in] print:min-h-[8in] print:max-h-[8in]"
              >
                  {/* Bifold 2-Panel Spread matching Page 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 print:grid-cols-2 print:gap-5 flex-1 min-h-0 relative">
                    
                    {/* Visual Center Fold Crease Guideline (print-friendly) */}
                    <div className="hidden print:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-r border-dashed border-slate-300 pointer-events-none" />

                    {/* OUTSIDE LEFT PANEL: Full-Page Lined Scout Notes */}
                    <div className="flex flex-col justify-between md:pr-1 print:pr-1 h-full min-h-0">
                      
                      {/* Dedicated Lined Scout Notes Section (Full Panel Height) */}
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Cyan Top Line */}
                        <div className="h-0.5 bg-[#00ADEF] w-full mb-1 shrink-0"></div>
                        
                        <div className="flex items-center justify-between mb-1 shrink-0">
                          <span className="font-condensed font-black text-sm tracking-wider uppercase text-slate-950 leading-none">
                            NOTES
                          </span>
                        </div>

                        {/* Ruled Notebook Lines that stretch to use all available height */}
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-h-[560px] print:min-h-0">
                          {Array.from({ length: 32 }).map((_, i) => (
                            <div key={i} className="border-b border-slate-300/90 w-full h-0"></div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* OUTSIDE RIGHT PANEL: Cover with SCOUTING ROSTER, Coach Info Beneath 2026 & Digital Team Website QR */}
                    <div className="flex flex-col justify-between md:pl-1 print:pl-1 h-full min-h-0">
                      
                      {/* Upper Center: Big Crest with Speed Racing Stripes + Title + Coach Information */}
                      <div className="flex-1 flex flex-col items-center justify-center py-1 sm:py-2 print:py-0">
                        
                        {/* Crest with Left & Right 3 Horizontal Stripes */}
                        <div className="w-full flex items-center justify-center gap-3 sm:gap-4 max-w-lg mb-2.5">
                          {/* 3 Black Stripes Left */}
                          <div className="flex-1 space-y-1.5">
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                            <div className="h-2 bg-slate-950 rounded-sm"></div>
                          </div>

                          {/* Force Shield Crest */}
                          <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0">
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

                        <h2 className="font-condensed font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-wider text-slate-950 text-center leading-tight mt-0.5">
                          {tournamentTitle || 'SCOUTING BROCHURE'}
                        </h2>

                        <div className="font-condensed font-black text-xl sm:text-2xl text-slate-950 tracking-wider text-center mt-0.5">
                          {currentYear}
                        </div>

                        {/* Coach Information Beneath "2026": Paul Bravo on top row (slightly larger), Yuta Tanaka & Larry Jackson side-by-side below */}
                        <div className="w-full max-w-md flex flex-col items-center gap-2 sm:gap-2.5 mt-2.5">
                          {/* Top Row: Head Coach Paul Bravo (Slightly Larger Featured Card) */}
                          <div className="w-full max-w-[270px] sm:max-w-[290px] flex flex-col justify-between bg-white border border-slate-300 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden relative px-3 py-2 print:px-2.5 print:py-1.5 print:shadow-none print:border-slate-300 text-center">
                            <div className="flex items-center justify-center">
                              <span className="font-bold text-[9.5px] print:text-[8.5px] uppercase tracking-wider text-[#00ADEF] leading-tight truncate">
                                HEAD COACH • ECNL DIR
                              </span>
                            </div>

                            <div className="my-1 min-w-0">
                              <h4 className="font-sans font-black text-sm sm:text-base print:text-xs uppercase tracking-tight text-slate-950 leading-tight truncate">
                                {paulBravo.name}
                              </h4>
                              <div className="text-[10px] print:text-[9px] text-slate-950 font-bold leading-tight mt-0.5 truncate">
                                {paulBravo.phone || '(720) 475-6991'}
                              </div>
                            </div>

                            <div className="pt-0.5 border-t border-slate-100 min-w-0">
                              <a
                                href={`mailto:${paulBravo.email || 'paulgbravo9@gmail.com'}`}
                                className="text-[9.5px] print:text-[8.5px] text-sky-800 hover:text-sky-600 font-medium truncate block leading-tight hover:underline"
                                title={paulBravo.email}
                              >
                                {paulBravo.email || 'paulgbravo9@gmail.com'}
                              </a>
                              <div className="h-1 bg-[#00ADEF] w-full mt-1 rounded-full"></div>
                            </div>
                          </div>

                          {/* Second Row: Yuta Tanaka & Larry Jackson Side-by-Side */}
                          <div className="w-full grid grid-cols-2 gap-2 sm:gap-2.5">
                            {/* Coach Box: Yuta Tanaka */}
                            <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative p-2 print:p-1.5 print:shadow-none print:border-slate-300 text-center">
                              <div className="flex items-center justify-center">
                                <span className="font-bold text-[8.5px] print:text-[7.5px] uppercase tracking-wider text-[#00ADEF] leading-tight truncate">
                                  STRENGTH &amp; AGILITY COACH
                                </span>
                              </div>

                              <div className="my-1 min-w-0">
                                <h4 className="font-sans font-black text-xs print:text-[10.5px] uppercase tracking-tight text-slate-950 leading-tight truncate">
                                  {yutaTanaka.name}
                                </h4>
                                <div className="text-[9px] print:text-[8px] text-slate-950 font-bold leading-tight mt-0.5 truncate">
                                  {yutaTanaka.phone || '(650) 619-3670'}
                                </div>
                              </div>

                              <div className="pt-0.5 border-t border-slate-100 min-w-0">
                                <a
                                  href={`mailto:${yutaTanaka.email || 'yuta.tanaka@gmail.com'}`}
                                  className="text-[8.5px] print:text-[7.5px] text-sky-800 hover:text-sky-600 font-medium truncate block leading-tight hover:underline"
                                  title={yutaTanaka.email}
                                >
                                  {yutaTanaka.email || 'yuta.tanaka@gmail.com'}
                                </a>
                                <div className="h-0.5 bg-[#00ADEF] w-full mt-0.5 rounded-full"></div>
                              </div>
                            </div>

                            {/* Coach Box: Larry Jackson */}
                            <div className="flex flex-col justify-between bg-white border border-slate-200/90 rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden relative p-2 print:p-1.5 print:shadow-none print:border-slate-300 text-center">
                              <div className="flex items-center justify-center">
                                <span className="font-bold text-[8.5px] print:text-[7.5px] uppercase tracking-wider text-[#00ADEF] leading-tight truncate">
                                  GOALKEEPER COACH
                                </span>
                              </div>

                              <div className="my-1 min-w-0">
                                <h4 className="font-sans font-black text-xs print:text-[10.5px] uppercase tracking-tight text-slate-950 leading-tight truncate">
                                  {larryJackson.name}
                                </h4>
                                {larryJackson.phone ? (
                                  <div className="text-[9px] print:text-[8px] text-slate-950 font-bold leading-tight mt-0.5 truncate">
                                    {larryJackson.phone}
                                  </div>
                                ) : null}
                              </div>

                              <div className="pt-0.5 border-t border-slate-100 min-w-0">
                                <a
                                  href={`mailto:${larryJackson.email || 'Larry.Jackson@deanzaforce.org'}`}
                                  className="text-[8.5px] print:text-[7.5px] text-sky-800 hover:text-sky-600 font-medium truncate block leading-tight hover:underline"
                                  title={larryJackson.email || 'Larry.Jackson@deanzaforce.org'}
                                >
                                  {larryJackson.email || 'Larry.Jackson@deanzaforce.org'}
                                </a>
                                <div className="h-0.5 bg-[#00ADEF] w-full mt-0.5 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lower Section: Team Website Self-Referential QR Code */}
                      <div className="mt-auto pt-2 border-t border-slate-200">
                        <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                          <a
                            href="https://www.deanzaforce2011g.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center gap-1"
                            title="Scan or click to open the official Team Website (https://www.deanzaforce2011g.com/)"
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.deanzaforce2011g.com/')}`}
                              alt="Team Website QR Code"
                              className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-slate-900 rounded bg-white p-1 shadow-xs group-hover:scale-105 transition-transform"
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
