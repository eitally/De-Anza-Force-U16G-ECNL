import React, { useState } from 'react';
import type { Match, StandingTeam, TeamInfo } from '../../types';
import { syncStandingsAndTeamInfoWithMatches } from '../../utils/recordUtils';
import { 
  Zap, 
  Trophy, 
  Save, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronDown 
} from 'lucide-react';

interface GameDayQuickScoreProps {
  matches: Match[];
  standings: StandingTeam[];
  teamInfo: TeamInfo;
  onSaveMatches: (matches: Match[]) => void;
  onSaveStandings: (standings: StandingTeam[]) => void;
  onSaveTeamInfo: (info: TeamInfo) => void;
  showNotification: (msg: string) => void;
}

export const GameDayQuickScore: React.FC<GameDayQuickScoreProps> = ({
  matches,
  standings,
  teamInfo,
  onSaveMatches,
  onSaveStandings,
  onSaveTeamInfo,
  showNotification,
}) => {
  // Default to the first upcoming or live match, or the most recent match
  const defaultMatchIndex = () => {
    const liveIdx = matches.findIndex(m => m.status === 'live');
    if (liveIdx !== -1) return liveIdx;
    const upcomingIdx = matches.findIndex(m => m.status === 'upcoming');
    if (upcomingIdx !== -1) return upcomingIdx;
    return 0;
  };

  const [selectedMatchIdx, setSelectedMatchIdx] = useState<number>(defaultMatchIndex);
  const activeMatch = matches[selectedMatchIdx] || matches[0];

  const [teamScore, setTeamScore] = useState<string>(
    activeMatch?.teamScore !== undefined ? String(activeMatch.teamScore) : ''
  );
  const [oppScore, setOppScore] = useState<string>(
    activeMatch?.opponentScore !== undefined ? String(activeMatch.opponentScore) : ''
  );
  const [matchStatus, setMatchStatus] = useState<'upcoming' | 'live' | 'completed'>(
    activeMatch?.status || 'completed'
  );

  // When selected match changes, update local state
  const handleSelectMatch = (idx: number) => {
    setSelectedMatchIdx(idx);
    const m = matches[idx];
    if (m) {
      setTeamScore(m.teamScore !== undefined ? String(m.teamScore) : '');
      setOppScore(m.opponentScore !== undefined ? String(m.opponentScore) : '');
      setMatchStatus(m.status);
    }
  };

  const handleSaveScore = () => {
    if (!activeMatch) return;

    const parsedTeamScore = teamScore === '' ? undefined : (parseInt(teamScore, 10) || 0);
    const parsedOppScore = oppScore === '' ? undefined : (parseInt(oppScore, 10) || 0);

    const updatedMatches = matches.map((m, idx) => {
      if (idx === selectedMatchIdx) {
        return {
          ...m,
          teamScore: parsedTeamScore,
          opponentScore: parsedOppScore,
          status: matchStatus,
        };
      }
      return m;
    });

    // Save matches
    onSaveMatches(updatedMatches);

    // If marked completed, auto-calculate standings and team season record
    if (matchStatus === 'completed' && parsedTeamScore !== undefined && parsedOppScore !== undefined) {
      const synced = syncStandingsAndTeamInfoWithMatches(updatedMatches, standings, teamInfo);
      onSaveStandings(synced.updatedStandings);
      onSaveTeamInfo(synced.updatedTeamInfo);
      showNotification(`⚡ Saved Final: De Anza Force ${parsedTeamScore} - ${parsedOppScore} ${activeMatch.opponent}. Standings & Record auto-synced!`);
    } else {
      showNotification(`✓ Updated score for match vs ${activeMatch.opponent}`);
    }
  };

  if (!activeMatch) return null;

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-950 via-[#0d1629] to-slate-900 border border-blue-500/40 shadow-xl space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-[#00ADEF] border border-blue-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white font-condensed">
                Game Day Mode
              </span>
              <h3 className="font-condensed font-black text-xl uppercase text-white tracking-wide">
                Quick Match Score & Standings Updater
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter the matchday score and click "Mark Final" to automatically recalculate NorCal standings points and team record.
            </p>
          </div>
        </div>

        {/* Fixture Selector Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedMatchIdx}
            onChange={e => handleSelectMatch(parseInt(e.target.value, 10))}
            className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-blue-500/40 text-white text-xs font-bold focus:border-[#00ADEF] cursor-pointer appearance-none"
          >
            {matches.map((m, idx) => (
              <option key={m.id || idx} value={idx}>
                {m.date} - vs {m.opponent} ({m.isHome ? 'H' : 'A'}) [{m.status.toUpperCase()}]
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Match Context Pill */}
      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <strong className="text-white">{activeMatch.date}</strong>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{activeMatch.time}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-red-400" />
          <span>{activeMatch.venue}</span>
        </span>
        <span>•</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
          activeMatch.isHome ? 'bg-blue-950 text-[#00ADEF]' : 'bg-amber-950 text-amber-300'
        }`}>
          {activeMatch.isHome ? 'Home Fixture' : 'Away Fixture'}
        </span>
      </div>

      {/* Interactive Scoreboard Input */}
      <div className="p-4 rounded-2xl bg-black/40 border border-blue-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Team 1: De Anza Force */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="text-right">
            <span className="font-condensed font-black text-base uppercase text-white block">
              De Anza Force U16G
            </span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              {activeMatch.isHome ? 'Home Team' : 'Visiting'}
            </span>
          </div>
          <input
            type="text"
            value={teamScore}
            onChange={e => setTeamScore(e.target.value)}
            placeholder="0"
            className="w-16 h-14 rounded-2xl bg-slate-900 border-2 border-blue-500/60 focus:border-[#00ADEF] text-center font-black text-2xl text-white focus:outline-none shadow-inner"
          />
        </div>

        {/* Separator / Status */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="font-condensed font-black text-2xl text-slate-500">VS</span>
          <select
            value={matchStatus}
            onChange={e => setMatchStatus(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-300 cursor-pointer"
          >
            <option value="completed">Completed (Final)</option>
            <option value="live">Live in Progress</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Team 2: Opponent */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <input
            type="text"
            value={oppScore}
            onChange={e => setOppScore(e.target.value)}
            placeholder="0"
            className="w-16 h-14 rounded-2xl bg-slate-900 border-2 border-slate-700 focus:border-[#00ADEF] text-center font-black text-2xl text-white focus:outline-none shadow-inner"
          />
          <div>
            <span className="font-condensed font-black text-base uppercase text-white block">
              {activeMatch.opponent}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {activeMatch.isHome ? 'Visiting' : 'Home Team'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSaveScore}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-condensed font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-900/40 cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Trophy className="w-4 h-4" />
          <span>{matchStatus === 'completed' ? 'Mark Final & Sync Standings' : 'Save Score'}</span>
        </button>
      </div>
    </div>
  );
};
