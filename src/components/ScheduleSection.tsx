import React, { useState, useMemo } from 'react';
import { Match, MatchStatus } from '../types';
import { 
  Calendar, 
  MapPin, 
  Navigation, 
  Clock, 
  Trophy, 
  Shirt, 
  CalendarPlus, 
  CheckCircle, 
  Sliders, 
  Tv, 
  ChevronDown, 
  ChevronUp, 
  List, 
  Grid, 
  Filter
} from 'lucide-react';

interface ScheduleSectionProps {
  matches: Match[];
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  matches,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Available unique months from match dates
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    matches.forEach((m) => {
      if (m.date) {
        const d = new Date(m.date + 'T00:00:00');
        const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
        months.add(monthKey);
      }
    });
    return Array.from(months);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        // Status filter
        if (filter !== 'all' && m.status !== filter) return false;
        // Month filter
        if (selectedMonth !== 'all') {
          const d = new Date(m.date + 'T00:00:00');
          const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
          if (monthKey !== selectedMonth) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date + (a.time ? `T${a.time.replace(/[^0-9:]/g, '')}` : 'T00:00:00')).getTime();
        const timeB = new Date(b.date + (b.time ? `T${b.time.replace(/[^0-9:]/g, '')}` : 'T00:00:00')).getTime();
        return timeA - timeB;
      });
  }, [matches, filter, selectedMonth]);

  // Display limit when not expanded (6 matches initially for high vertical efficiency)
  const INITIAL_LIMIT = 6;
  const displayedMatches = useMemo(() => {
    if (isExpanded || filteredMatches.length <= INITIAL_LIMIT) {
      return filteredMatches;
    }
    return filteredMatches.slice(0, INITIAL_LIMIT);
  }, [filteredMatches, isExpanded]);

  // Export .ics calendar event
  const handleExportICS = (match: Match) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//De Anza Force U16 ECNL//Soccer Match//EN',
      'BEGIN:VEVENT',
      `SUMMARY:De Anza Force U16 ${match.isHome ? 'vs' : 'at'} ${match.opponent}`,
      `DESCRIPTION:De Anza Force U16 ECNL Soccer Match\\nCompetition: ${match.competition}\\nKit: ${match.homeKitColor}\\nNotes: ${match.gameNotes || 'Bring both blue and black jerseys.'}`,
      `LOCATION:${match.venue}, ${match.address}`,
      `DTSTART:${match.date.replace(/-/g, '')}T180000Z`,
      `DTEND:${match.date.replace(/-/g, '')}T200000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DeAnzaForce_${match.isHome ? 'vs' : 'at'}_${match.opponent.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="schedule" className="py-8 sm:py-12 bg-white dark:bg-[#080c14] border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              MATCH <span className="text-[#00ADEF]">SCHEDULE</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Compact fixture list for ECNL NorCal league games, national showcases, and playoff matches.
            </p>
          </div>

          {/* Controls: View Switcher & Editor CTA */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('compact')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Cards Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar: Status Tabs & Month Pills */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center bg-white dark:bg-slate-900/90 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Upcoming ({matches.filter((m) => m.status === 'upcoming').length})
            </button>

            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Results ({matches.filter((m) => m.status === 'completed').length})
            </button>

            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({matches.length})
            </button>
          </div>

          {/* Month Pills for instant fast scrolling */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Month:
            </span>
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 ${
                selectedMonth === 'all'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              All
            </button>
            {availableMonths.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 ${
                  selectedMonth === m
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* COMPACT LIST VIEW (Standard High-Density Format) */}
        {viewMode === 'compact' && (
          <div className="mt-4 rounded-2xl bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-xl">
            {/* Table Header on Desktop */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <div className="col-span-3">Date & Competition</div>
              <div className="col-span-4">Matchup & Score</div>
              <div className="col-span-3">Venue & Kit</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-800/60">
              {displayedMatches.map((match) => {
                const isWin = match.status === 'completed' && (match.teamScore ?? 0) > (match.opponentScore ?? 0);
                const isDraw = match.status === 'completed' && (match.teamScore ?? 0) === (match.opponentScore ?? 0);

                return (
                  <div
                    key={match.id}
                    className="p-3 sm:p-3.5 hover:bg-white dark:hover:bg-slate-900/60 transition-colors group"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                      
                      {/* Col 1: Date, Time, Competition */}
                      <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-2.5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {new Date(match.date + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {match.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#00ADEF] mt-0.5">
                            <Trophy className="w-2.5 h-2.5 text-yellow-500 shrink-0" />
                            <span className="truncate max-w-[170px]">{match.competition}</span>
                          </div>
                        </div>

                        {/* Mobile Status Tag */}
                        <span className={`lg:hidden px-2 py-0.5 rounded-md text-[11px] font-sans font-bold uppercase tracking-wider ${
                          match.isHome ? 'bg-blue-950/90 text-[#00ADEF] border border-blue-800/80' : 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
                        }`}>
                          {match.isHome ? 'HOME' : 'AWAY'}
                        </span>
                      </div>

                      {/* Col 2: Matchup & Score */}
                      <div className="lg:col-span-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Home / Away Pill Badge (Large, legible font) */}
                          <span className={`hidden lg:inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[11px] font-sans font-bold uppercase tracking-wider shrink-0 ${
                            match.isHome 
                              ? 'bg-blue-950/90 text-[#00ADEF] border border-blue-800/80 shadow-xs' 
                              : 'bg-amber-950/90 text-amber-300 border border-amber-800/80 shadow-xs'
                          }`}>
                            {match.isHome ? 'HOME' : 'AWAY'}
                          </span>

                          <div className="flex flex-col min-w-0">
                            <span className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                              De Anza Force{' '}
                              <span className={match.isHome ? 'text-slate-500 dark:text-slate-400 font-bold' : 'text-amber-400 font-black'}>
                                {match.isHome ? 'vs' : 'at'}
                              </span>{' '}
                              {match.opponent}
                            </span>
                            {match.scorers && match.scorers.length > 0 && (
                              <span className="text-[10px] text-emerald-400 truncate">
                                Goals: {match.scorers.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score or VS Badge */}
                        <div className="shrink-0">
                          {match.status === 'completed' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                                {match.teamScore} - {match.opponentScore}
                              </span>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                isWin ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : isDraw ? 'bg-amber-950 text-amber-300' : 'bg-red-950 text-red-300'
                              }`}>
                                {isWin ? 'W' : isDraw ? 'D' : 'L'}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Col 3: Venue & Kit */}
                      <div className="lg:col-span-3 flex flex-col text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 truncate">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <a href={match.mapUrl} target="_blank" rel="noopener noreferrer" className="truncate text-xs font-semibold hover:text-blue-400 hover:underline">{match.venue}</a>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="text-blue-400 font-semibold">Kit: {match.homeKitColor}</span>
                          {match.fieldNumber && <span>Field: {match.fieldNumber}</span>}
                        </div>
                      </div>

                      {/* Col 4: Quick Action Buttons */}
                      <div className="lg:col-span-2 flex items-center justify-end gap-1.5 shrink-0">
                        {match.videoLiveStreamUrl && (
                          <a
                            href={match.videoLiveStreamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-slate-900 dark:hover:text-white border border-red-500/40 transition-colors"
                            title="Watch Live Stream"
                          >
                            <Tv className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <a
                          href={match.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-blue-600 text-blue-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
                          title="GPS Directions"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>

                        {match.status === 'upcoming' && (
                          <button
                            onClick={() => handleExportICS(match)}
                            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-blue-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
                            title="Add to Calendar (.ics)"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CARDS GRID VIEW (2-column compact cards for those who want visual blocks) */}
        {viewMode === 'cards' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedMatches.map((match) => {
              const isWin = match.status === 'completed' && (match.teamScore ?? 0) > (match.opponentScore ?? 0);
              const isDraw = match.status === 'completed' && (match.teamScore ?? 0) === (match.opponentScore ?? 0);

              return (
                <div
                  key={match.id}
                  className="rounded-xl bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800/90 p-3.5 hover:border-blue-500/50 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-white font-sans font-bold">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {new Date(match.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })} • {match.time}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#00ADEF] bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/60 truncate max-w-[140px]">
                      {match.competition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 my-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                        De Anza Force{' '}
                        <span className={match.isHome ? 'text-slate-500 dark:text-slate-400 font-bold' : 'text-amber-400 font-black'}>
                          {match.isHome ? 'vs' : 'at'}
                        </span>{' '}
                        {match.opponent}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <a href={match.mapUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-blue-400 hover:underline">{match.venue}</a>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {match.status === 'completed' ? (
                        <div className="flex flex-col items-end">
                          <span className="font-sans font-bold text-base text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            {match.teamScore} - {match.opponentScore}
                          </span>
                          <span className={`text-[9px] font-black uppercase mt-0.5 ${
                            isWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {isWin ? 'VICTORY' : isDraw ? 'DRAW' : 'FINAL'}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                          match.isHome ? 'bg-blue-950/90 text-[#00ADEF] border border-blue-800/80' : 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
                        }`}>
                          {match.isHome ? 'HOME' : 'AWAY'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-blue-400 font-semibold">Kit: {match.homeKitColor}</span>
                    <div className="flex items-center gap-1.5">
                      {match.videoLiveStreamUrl && (
                        <a
                          href={match.videoLiveStreamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-slate-900 dark:hover:text-white text-xs"
                          title="Live Stream"
                        >
                          <Tv className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={match.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-400 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-800"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Map</span>
                      </a>
                      {match.status === 'upcoming' && (
                        <button
                          onClick={() => handleExportICS(match)}
                          className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>+Cal</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show More / Show Less Button if items exceed limit */}
        {filteredMatches.length > INITIAL_LIMIT && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-sans font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all shadow-md cursor-pointer"
            >
              <span>
                {isExpanded
                  ? 'Show Less Fixtures'
                  : `View All ${filteredMatches.length} Matches (${filteredMatches.length - INITIAL_LIMIT} More)`}
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <div className="mt-6 text-center py-10 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-slate-900 dark:text-white font-sans font-bold text-lg uppercase">No matches match this filter</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try switching to "All Matches" or select a different month.</p>
          </div>
        )}

      </div>
    </section>
  );
};
