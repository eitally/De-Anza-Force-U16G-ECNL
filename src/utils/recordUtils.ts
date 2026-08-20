import { Match, StandingTeam, TeamInfo } from '../types';

export interface ComputedRecord {
  wins: number;
  losses: number;
  draws: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  played: number;
  points: number;
  pointsPerGame: number;
  form: ('W' | 'D' | 'L' | '-')[];
  completedMatchesCount: number;
}

/**
 * Computes official De Anza Force season record and last 5 match form
 * automatically from the completed fixtures in the match schedule.
 */
export function computeRecordAndFormFromMatches(matches: Match[]): ComputedRecord {
  // Filter matches that have been completed or have recorded scores
  const completedMatches = matches.filter((m) => {
    if (m.status === 'completed') return true;
    if (m.teamScore !== undefined && m.opponentScore !== undefined && m.status !== 'upcoming') return true;
    if ((m as any).homeScore !== undefined && (m as any).awayScore !== undefined && m.status !== 'upcoming') return true;
    return false;
  });

  // Sort by date (assuming YYYY-MM-DD or standard parseable dates)
  const sorted = [...completedMatches].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeA - timeB;
  });

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;
  const matchResults: ('W' | 'D' | 'L')[] = [];

  sorted.forEach((m) => {
    let teamScore = 0;
    let oppScore = 0;

    if (typeof m.teamScore === 'number' && typeof m.opponentScore === 'number') {
      teamScore = m.teamScore;
      oppScore = m.opponentScore;
    } else {
      const hScore = typeof (m as any).homeScore === 'number' ? (m as any).homeScore : 0;
      const aScore = typeof (m as any).awayScore === 'number' ? (m as any).awayScore : 0;
      if (m.isHome) {
        teamScore = hScore;
        oppScore = aScore;
      } else {
        teamScore = aScore;
        oppScore = hScore;
      }
    }

    goalsFor += teamScore;
    goalsAgainst += oppScore;

    if (oppScore === 0) {
      cleanSheets += 1;
    }

    if (teamScore > oppScore) {
      wins += 1;
      matchResults.push('W');
    } else if (teamScore === oppScore) {
      draws += 1;
      matchResults.push('D');
    } else {
      losses += 1;
      matchResults.push('L');
    }
  });

  const played = wins + losses + draws;
  const goalDifference = goalsFor - goalsAgainst;
  const points = wins * 3 + draws;
  const pointsPerGame = played > 0 ? Number((points / played).toFixed(2)) : 0;

  // Last 5 matches form (oldest to newest among the last 5)
  const last5 = matchResults.slice(-5);
  // Pad with '-' if fewer than 5 matches played
  while (last5.length < 5) {
    last5.unshift('-' as any);
  }

  return {
    wins,
    losses,
    draws,
    goalsFor,
    goalsAgainst,
    goalDifference,
    cleanSheets,
    played,
    points,
    pointsPerGame,
    form: last5,
    completedMatchesCount: completedMatches.length,
  };
}

/**
 * Synchronizes Standings array and TeamInfo season record with the schedule
 */
export function syncStandingsAndTeamInfoWithMatches(
  matches: Match[],
  standings: StandingTeam[],
  teamInfo: TeamInfo
): { updatedStandings: StandingTeam[]; updatedTeamInfo: TeamInfo; computed: ComputedRecord } {
  const computed = computeRecordAndFormFromMatches(matches);

  // Update Standings table De Anza row
  const updatedStandings = standings.map((team) => {
    if (team.isCurrentTeam || team.isForce || team.teamName.toLowerCase().includes('de anza')) {
      return {
        ...team,
        played: computed.played,
        gamesPlayed: computed.played,
        won: computed.wins,
        wins: computed.wins,
        lost: computed.losses,
        losses: computed.losses,
        drawn: computed.draws,
        draws: computed.draws,
        goalsFor: computed.goalsFor,
        goalsAgainst: computed.goalsAgainst,
        goalDifference: computed.goalDifference,
        points: computed.points,
        pointsPerGame: computed.pointsPerGame,
        form: computed.form,
      };
    }
    return team;
  });

  // Update TeamInfo season record
  const updatedTeamInfo: TeamInfo = {
    ...teamInfo,
    seasonRecord: {
      ...teamInfo.seasonRecord,
      wins: computed.wins,
      losses: computed.losses,
      draws: computed.draws,
      goalsFor: computed.goalsFor,
      goalsAgainst: computed.goalsAgainst,
      cleanSheets: computed.cleanSheets,
    },
  };

  return { updatedStandings, updatedTeamInfo, computed };
}
