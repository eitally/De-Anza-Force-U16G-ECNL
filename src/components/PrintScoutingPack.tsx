import React from 'react';
import { Player, TeamInfo, Coach } from '../types';
import { ClubCrest } from './ClubCrest';
import { Printer, X, Download, Mail, Phone, GraduationCap, Shield, ExternalLink, QrCode } from 'lucide-react';

interface PrintScoutingPackProps {
  isOpen: boolean;
  onClose: () => void;
  teamInfo: TeamInfo;
  players: Player[];
  coaches: Coach[];
}

export const PrintScoutingPack: React.FC<PrintScoutingPackProps> = ({
  isOpen,
  onClose,
  teamInfo,
  players,
  coaches,
}) => {
  if (!isOpen) return null;

  const recruitingCoach = (coaches && coaches.length > 0) ? (coaches.find((c) => (c.role || '').toLowerCase().includes('recruiting')) || coaches[0]) : null;
  const headCoach = (coaches && coaches.length > 0) ? (coaches.find((c) => (c.role || '').toLowerCase().includes('head coach')) || coaches[0]) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/90 backdrop-blur-md print-scouting-pack">
      <div 
        className="relative w-full max-w-6xl rounded-2xl bg-white text-slate-900 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-between gap-4 shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span className="font-condensed font-black text-lg uppercase tracking-wider">
              Official College Coach Scouting Roster
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto print:overflow-visible print:p-0">
          
          {/* Header Section with De Anza Force Logo at Top Left */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* De Anza Force Logo at top left with crisp white background */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-white p-1.5 border border-slate-300 shadow-sm flex items-center justify-center">
                <ClubCrest size="sm" showText={false} />
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-700">
                  <span>{teamInfo.clubName}</span>
                  <span>•</span>
                  <span>{teamInfo.league}</span>
                </div>
                <h1 className="font-condensed font-black text-2xl sm:text-3xl uppercase text-slate-950 tracking-tight leading-none mt-1">
                  {teamInfo.teamName}
                </h1>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  Age Group: {teamInfo.ageGroup} • Region: Bay Area, CA
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <div className="font-black text-slate-900 uppercase">Season Record: {teamInfo.seasonRecord.wins}-{teamInfo.seasonRecord.losses}-{teamInfo.seasonRecord.draws}</div>
              <div className="text-slate-600">NorCal Rank: #{teamInfo.seasonRecord.norcalRank} • National Rank: #{teamInfo.seasonRecord.nationalRank}</div>
              <div className="text-[10px] text-slate-500 mt-1">Document Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Coaching Staff Contact Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-xs mb-4">
            <div>
              <div className="font-bold text-slate-900">{headCoach?.name}</div>
              <div className="text-[10px] text-slate-600">{headCoach?.role}</div>
              <div className="text-[11px] text-blue-800 font-semibold">{headCoach?.email}</div>
            </div>

            <div>
              <div className="font-bold text-slate-900">{recruitingCoach?.name}</div>
              <div className="text-[10px] text-slate-600">{recruitingCoach?.role}</div>
              <div className="text-[11px] text-blue-800 font-semibold">{recruitingCoach?.email}</div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="font-bold text-slate-900">Home Facility</div>
              <div className="text-[10px] text-slate-600">{teamInfo.homeFacility}</div>
              <div className="text-[10px] text-slate-600">{teamInfo.facilityAddress}</div>
            </div>
          </div>

          {/* Roster Table with Compact Row Padding, Larger High-Legibility Fonts & Spanning QR Codes */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs sm:text-[12.5px] text-slate-900 border-collapse">
              <thead className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-condensed font-black uppercase tracking-wider text-xs sm:text-[12px]">
                <tr>
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2.5 min-w-[145px]">Player Name</th>
                  <th className="py-2 px-2">Pos</th>
                  <th className="py-2 px-2">Grad</th>
                  <th className="py-2 px-2">Ht / Wt / Foot</th>
                  <th className="py-2 px-2.5 min-w-[170px]">Player Email</th>
                  <th className="py-2 px-2 text-center">GPA</th>
                  <th className="py-2 px-2">NCAA ID</th>
                  <th className="py-2 px-2">Commitment</th>
                  <th className="py-2 px-2 text-center w-20">Profile QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {players.map((player) => {
                  // Ensure QR code always encodes a fully qualified, scannable web URL
                  const getPlayerLiveUrl = (p: Player) => {
                    if (p.profilePdfUrl && p.profilePdfUrl.startsWith('http')) return p.profilePdfUrl;
                    if (p.profileDocUrl && p.profileDocUrl.startsWith('http')) return p.profileDocUrl;
                    if (p.highlightsUrl && p.highlightsUrl.startsWith('http')) return p.highlightsUrl;
                    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://de-anza-force-u16-g-ecnl.vercel.app';
                    return `${origin}/?player=${p.id}`;
                  };

                  const qrTarget = getPlayerLiveUrl(player);
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrTarget)}`;
                  const profileUrl = player.profilePdfUrl || player.profileDocUrl || player.highlightsUrl || qrTarget;

                  return (
                    <React.Fragment key={player.id}>
                      {/* Primary Info Row with Tight Padding & Larger Crisp Font */}
                      <tr className="hover:bg-slate-50/80 transition-colors print-break-inside-avoid">
                        <td className="py-1.5 px-2 text-center font-bold text-slate-900 bg-slate-100 font-condensed text-sm">
                          #{player.jerseyNumber}
                        </td>
                        <td className="py-1.5 px-2.5 font-bold text-[13px] sm:text-[13.5px]">
                          {profileUrl !== '#' ? (
                            <a
                              href={profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-900 hover:text-blue-600 underline font-bold transition-colors inline-flex items-center gap-1"
                              title="Click to open downloadable profile PDF"
                            >
                              <span>{player.name}</span>
                              {player.isCaptain && <span className="text-[10px] text-amber-600 no-underline">(C)</span>}
                            </a>
                          ) : (
                            <span className="text-slate-950">
                              {player.name} {player.isCaptain && <span className="text-[10px] text-amber-600">(C)</span>}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 font-semibold text-blue-900 whitespace-nowrap text-xs">
                          {player.specificPosition}
                        </td>
                        <td className="py-1.5 px-2 text-slate-800 font-medium whitespace-nowrap">
                          {player.gradYear}
                        </td>
                        <td className="py-1.5 px-2 text-slate-800 whitespace-nowrap text-xs">
                          {player.height} {player.weight ? `• ${player.weight}` : ''} • {player.dominantFoot ? player.dominantFoot[0] : 'R'}
                        </td>
                        {/* Fully legible, unobscured email with increased font */}
                        <td className="py-1.5 px-2.5 text-slate-900 font-mono text-[11px] break-all leading-tight">
                          {player.contactEmail ? (
                            <a href={`mailto:${player.contactEmail}`} className="hover:underline text-slate-950 font-medium">
                              {player.contactEmail}
                            </a>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 italic">Via Coaching Staff</span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 font-black text-emerald-800 text-center text-xs">
                          {player.gpa}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                          {player.ncaaId || '—'}
                        </td>
                        <td className="py-1.5 px-2 font-semibold text-xs whitespace-nowrap">
                          {player.commitment !== 'Uncommitted' ? (
                            <span className="text-emerald-700 font-bold">★ {player.commitment}</span>
                          ) : (
                            <span className="text-slate-600">Uncommitted</span>
                          )}
                        </td>
                        {/* Spanning QR Code linked to Player Profile PDF */}
                        <td rowSpan={2} className="py-1 px-2 text-center align-middle border-l border-slate-300 bg-slate-50 print:bg-transparent w-20">
                          <a
                            href={profileUrl !== '#' ? profileUrl : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center group"
                            title={`Scan or click to view ${player.name}'s profile PDF`}
                          >
                            <img
                              src={qrCodeUrl}
                              alt={`QR Code for ${player.name}`}
                              className="w-12 h-12 border border-slate-300 rounded bg-white p-0.5 shadow-xs group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            <span className="text-[7.5px] font-bold text-slate-600 uppercase tracking-tighter mt-0.5 leading-none group-hover:text-blue-700">
                              PDF Flyer
                            </span>
                          </a>
                        </td>
                      </tr>

                      {/* Dedicated Notes Sub-Row for College Evaluators */}
                      <tr className="bg-slate-50/60 border-b-2 border-slate-300 print-break-inside-avoid">
                        <td colSpan={9} className="py-1.5 px-2.5 text-[10.5px] text-slate-600 border-t border-dashed border-slate-200">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 text-[9.5px]">
                              Scout Notes:
                            </span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-2"></div>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 text-[9.5px] invisible">
                              Scout Notes:
                            </span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-2"></div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="mt-4 pt-3 border-t border-slate-300 text-[10px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
            <span>De Anza Force U16 ECNL • Official Team College Scouting Roster • Region: Bay Area, CA</span>
            <span>Player video reels and full PDF showcase flyers accessible via QR codes above.</span>
          </div>

        </div>
      </div>
    </div>
  );
};
