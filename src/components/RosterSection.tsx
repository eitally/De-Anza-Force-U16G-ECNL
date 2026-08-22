import React, { useState, useMemo } from 'react';
import { Player, PositionCategory, TeamInfo } from '../types';
import { PlayerCard } from './PlayerCard';
import { getSafeImageSrc, handleImageError, DEFAULT_PLAYER_PHOTO } from '../utils/imageUtils';
import { 
  Users, 
  LayoutGrid, 
  List, 
  Camera,
  Maximize2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RosterSectionProps {
  players: Player[];
  teamInfo?: TeamInfo;
  onSelectPlayer: (player: Player) => void;
  onOpenTeamPhotoEditor?: () => void;
}

export const RosterSection: React.FC<RosterSectionProps> = ({
  players,
  teamInfo,
  onSelectPlayer,
  onOpenTeamPhotoEditor,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<PositionCategory | 'All'>('All');
    const [commitmentFilter, setCommitmentFilter] = useState<'All' | 'Committed' | 'Uncommitted'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);

  const teamPhotoUrl = teamInfo?.teamPhotoUrl;
  const teamPhotoCaption = teamInfo?.teamPhotoCaption || '2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff';

  // Filter logic (retains natural squad / jersey number order)
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Position filter
      if (selectedPosition !== 'All' && player.primaryPosition !== selectedPosition) {
        return false;
      }

      // Commitment filter
      if (commitmentFilter === 'Committed' && player.commitment === 'Uncommitted') {
        return false;
      }
      if (commitmentFilter === 'Uncommitted' && player.commitment !== 'Uncommitted') {
        return false;
      }

      return true;
    });
  }, [players, selectedPosition, commitmentFilter]);

  // Position counts
  const counts = useMemo(() => {
    return {
      All: players.length,
      Forward: players.filter((p) => p.primaryPosition === 'Forward').length,
      Midfielder: players.filter((p) => p.primaryPosition === 'Midfielder').length,
      Defender: players.filter((p) => p.primaryPosition === 'Defender').length,
      Goalkeeper: players.filter((p) => p.primaryPosition === 'Goalkeeper').length,
    };
  }, [players]);

  return (
    <section id="roster" className="relative py-8 sm:py-12 bg-white dark:bg-[#080c14] border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              2026-2027 <span className="text-[#00ADEF]">OFFICIAL ROSTER</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Showcasing all {players.length} student-athletes on the De Anza Force U16 ECNL squad. 
              Click any athlete card to view academic records, NCAA eligibility, match film, and scouting notes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {teamPhotoUrl ? (
              <>
                {onOpenTeamPhotoEditor && (
                  <button
                    onClick={onOpenTeamPhotoEditor}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/40 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Change Photo</span>
                  </button>
                )}
              </>
            ) : (
              onOpenTeamPhotoEditor && (
                <button
                  onClick={onOpenTeamPhotoEditor}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Upload Squad Portrait</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Official Squad Photo Banner */}
        {teamPhotoUrl && (
          <div className="mt-5 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl group relative">
            <div onClick={() => setIsPhotoLightboxOpen(true)} className="relative aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] max-h-[380px] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-pointer">
              <img
                src={teamPhotoUrl}
                alt={teamPhotoCaption}
                className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
                onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
              
              {/* Overlay Badges & Controls */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-5 sm:right-5 flex items-end justify-between gap-3">
                <div>
                  
                  <h3 className="font-condensed font-black text-base sm:text-xl md:text-2xl text-slate-900 dark:text-white drop-shadow-md">
                    {teamPhotoCaption}
                  </h3>
                </div>

                
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls & Search Bar */}
        <div className="mt-5 space-y-3.5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Position Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900/90 rounded-xl p-1 border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none text-xs">
              {(['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedPosition === pos
                      ? 'bg-[#00ADEF]/10 dark:bg-[#00ADEF]/20 text-[#00ADEF] border border-[#00ADEF]/30'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
                  }`}
                >
                  <span>{pos === 'All' ? 'Full Squad' : pos}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      selectedPosition === pos
                        ? 'bg-[#00ADEF]/20 text-[#00ADEF]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {counts[pos]}
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode & Commitment Quick Filters */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Commitment Filter */}
              <div className="flex items-center bg-white dark:bg-slate-900/90 rounded-xl p-1 border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setCommitmentFilter('All')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    commitmentFilter === 'All'
                      ? 'bg-blue-100 dark:bg-blue-600/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setCommitmentFilter('Uncommitted')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    commitmentFilter === 'Uncommitted'
                      ? 'bg-red-100 dark:bg-red-600/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Uncommitted
                </button>
                <button
                  onClick={() => setCommitmentFilter('Committed')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    commitmentFilter === 'Committed'
                      ? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Committed
                </button>
              </div>

              {/* View Mode Toggle: Grid vs Table */}
              <div className="flex items-center bg-white dark:bg-slate-900/90 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 gap-2">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-900 dark:text-white">{filteredPlayers.length}</strong> of {players.length} athletes</span>
            {selectedPosition !== 'All' && (
              <span className="text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                Position: {selectedPosition}
              </span>
            )}
          </div>
        </div>

        {/* Player Roster Grid View */}
        {viewMode === 'grid' && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onSelectPlayer={onSelectPlayer}
              />
            ))}
          </div>
        )}

        {/* Player Roster Table View */}
        {viewMode === 'table' && (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 shadow-2xl">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 select-none">
              <thead className="bg-slate-100 dark:bg-[#0e1628] font-condensed font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Player</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Grad Year</th>
                  <th className="py-3.5 px-4">Height / Foot</th>
                  <th className="py-3.5 px-4">High School</th>
                  <th className="py-3.5 px-4">GPA</th>
                  <th className="py-3.5 px-4">NCAA ID</th>
                  <th className="py-3.5 px-4">Commitment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPlayers.map((player) => (
                  <tr
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="hover:bg-blue-950/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <span className="font-condensed font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">
                        #{player.jerseyNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getSafeImageSrc(player.photoUrl, DEFAULT_PLAYER_PHOTO)}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 group-hover:border-blue-400 transition-colors"
                          onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                        />
                        <div>
                          <div className="font-bold text-black dark:text-white text-sm group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            {player.name}
                            {player.isCaptain && (
                              <span className="text-[9px] font-black bg-amber-500 text-black px-1.5 py-0.2 rounded font-condensed">CAPTAIN</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{player.hometown || 'Bay Area, CA'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">
                      {player.specificPosition}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-700 dark:text-slate-200">Class of {player.gradYear}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700 dark:text-slate-200">{player.height}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{player.dominantFoot} Foot</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {player.highSchool}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-400">
                      {player.gpa}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {player.ncaaId || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {player.commitment !== 'Uncommitted' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold">
                          {player.commitment}
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Uncommitted</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPlayer(player);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white font-bold text-xs border border-blue-500/40 transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="mt-12 text-center py-16 rounded-2xl bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-condensed font-black text-2xl uppercase text-slate-900 dark:text-white">
              No matching players found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Try adjusting your search criteria or position filters to explore the full squad.
            </p>
            <button
              onClick={() => {
                setSelectedPosition('All');
                setCommitmentFilter('All');
                              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Squad Photo Lightbox Modal */}
        {isPhotoLightboxOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
            <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-condensed font-black text-xs uppercase">
                    Squad Portrait
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {teamPhotoCaption}
                  </span>
                </div>
                <button
                  onClick={() => setIsPhotoLightboxOpen(false)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={teamPhotoUrl}
                  alt={teamPhotoCaption}
                  className="w-full h-full object-contain" onError={(e) => handleImageError(e, DEFAULT_PLAYER_PHOTO)}
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>De Anza Force U16 ECNL • 2026-2027 Season</span>
                <button
                  onClick={() => setIsPhotoLightboxOpen(false)}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
