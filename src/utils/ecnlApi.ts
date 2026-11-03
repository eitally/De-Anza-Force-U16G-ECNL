import type { Match, MatchCompetition, MatchStatus, StandingTeam, TeamInfo } from '../types';

export const ECNL_DATA_API_URL =
  'https://script.google.com/macros/s/AKfycbz1R3shf0s2xmuXxf1QqiKCAHqXl-dX7biOwj8gi8dUmNYlKlUK82QWSLY8r4ugR6TGbw/exec';

export interface EcnlApiStandingRow {
  POS?: string | number;
  TEAMS?: string;
  GP?: string | number;
  WINS?: string | number;
  LOSSES?: string | number;
  DRAWS?: string | number;
  GF?: string | number;
  GA?: string | number;
  GD?: string | number;
  PPG?: string | number;
  PTS?: string | number;
  FORM?: string;
  [key: string]: unknown;
}

export interface EcnlApiScheduleRow {
  'GM#'?: string | number;
  DATE?: string;
  TIME?: string;
  COMPETITION?: string;
  'HOME/AWAY'?: string;
  OPPONENT?: string;
  MATCHUP?: string;
  VENUE?: string;
  KIT?: string;
  STATUS?: string;
  RESULT?: string;
  'SCORE DISPLAY'?: string;
  GF?: string | number;
  GA?: string | number;
  'HOME SCORE'?: string | number;
  'AWAY SCORE'?: string | number;
  [key: string]: unknown;
}

export interface EcnlApiPayload {
  updatedAt?: string;
  standings?: EcnlApiStandingRow[];
  schedule?: EcnlApiScheduleRow[];
}

function getField(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
  }
  const normalizedTargetKeys = keys.map((k) => k.toLowerCase().replace(/[^a-z0-9#]/g, ''));
  for (const [entryKey, val] of Object.entries(row)) {
    const normEntry = entryKey.toLowerCase().replace(/[^a-z0-9#]/g, '');
    if (normalizedTargetKeys.includes(normEntry) && val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function parseIntSafe(val: string, fallback = 0): number {
  if (!val) return fallback;
  const cleaned = val.replace(/^\+/, '').trim();
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseOptionalInt(val: string): number | undefined {
  if (!val) return undefined;
  const cleaned = val.replace(/^\+/, '').trim();
  if (!/^-?\d+$/.test(cleaned)) return undefined;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseFloatSafe(val: string, fallback = 0): number {
  if (!val) return fallback;
  const cleaned = val.replace(/^\+/, '').trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Normalizes dates like "Aug 22, 2026", "11/07/26", "2026-08-22", or ISO strings to "YYYY-MM-DD"
 * so sorting, month tabs, and calendar exports work consistently.
 */
export function normalizeMatchDateString(rawDate: string): string {
  const trimmed = (rawDate || '').trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle MM/DD/YY or MM/DD/YYYY explicitly so 2-digit years map to 20YY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const month = slashMatch[1].padStart(2, '0');
    const day = slashMatch[2].padStart(2, '0');
    const yearRaw = slashMatch[3];
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

/**
 * Converts a match's date (and optional kickoff time) into a numeric timestamp for chronological sorting.
 */
export function getMatchSortTimestamp(match?: Partial<Match> | null): number {
  if (!match || !match.date) return Number.MAX_SAFE_INTEGER;
  const isoDate = normalizeMatchDateString(match.date);
  const baseDate = /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
    ? new Date(`${isoDate}T00:00:00`)
    : new Date(isoDate);
  const baseTime = baseDate.getTime();
  if (Number.isNaN(baseTime)) return Number.MAX_SAFE_INTEGER;

  // Optional tie-breaker using kickoff time (e.g. "01:00 PM PST")
  let minutesOffset = 0;
  if (match.time) {
    const timeMatch = match.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = Number.parseInt(timeMatch[1], 10);
      const mins = Number.parseInt(timeMatch[2], 10) || 0;
      const meridiem = (timeMatch[3] || '').toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      minutesOffset = hours * 60 + mins;
    }
  }

  return baseTime + minutesOffset * 60 * 1000;
}

/**
 * Normalizes known rescheduled fixtures (such as GM# 1094723 at Santa Rosa United moved to March 2027)
 * and sorts the entire match schedule strictly by calendar date ascending (never by GM# / match number).
 */
export function sortMatchesByDate(matches: Match[]): Match[] {
  if (!Array.isArray(matches)) return [];

  const normalized = matches
    .filter((m): m is Match => Boolean(m))
    .map((m) => {
      let cleanDate = normalizeMatchDateString(m.date);
      const isSantaRosaAwayRescheduled =
        (m.id === 'm1094723' || m.id === '1094723' || (!m.isHome && /santa\s*rosa/i.test(m.opponent || ''))) &&
        m.status !== 'completed' &&
        cleanDate.startsWith('2026-10');

      if (isSantaRosaAwayRescheduled) {
        cleanDate = '2027-03-27';
      }

      return {
        ...m,
        date: cleanDate || m.date,
      };
    });

  return [...normalized].sort((a, b) => getMatchSortTimestamp(a) - getMatchSortTimestamp(b));
}

/**
 * Maps the `standings` array from the Google Apps Script JSON payload into `StandingTeam[]`.
 */
export function mapEcnlApiStandings(
  rawStandings: EcnlApiStandingRow[] | undefined,
  fallbackStandings: StandingTeam[]
): StandingTeam[] {
  if (!Array.isArray(rawStandings) || rawStandings.length === 0) {
    return fallbackStandings;
  }

  const mapped: StandingTeam[] = rawStandings
    .map((row, index): StandingTeam | null => {
      if (!row || typeof row !== 'object') return null;

      const teamName = getField(row, 'TEAMS', 'TEAM', 'TEAM NAME', 'CLUB');
      if (!teamName) return null;

      const rank = parseIntSafe(getField(row, 'POS', 'RANK', '#'), index + 1);
      const played = parseIntSafe(getField(row, 'GP', 'PLAYED', 'MP'), 0);
      const won = parseIntSafe(getField(row, 'WINS', 'W', 'WIN'), 0);
      const lost = parseIntSafe(getField(row, 'LOSSES', 'L', 'LOSS'), 0);
      const drawn = parseIntSafe(getField(row, 'DRAWS', 'D', 'DRAW', 'T'), 0);
      const goalsFor = parseIntSafe(getField(row, 'GF', 'GOALS FOR', 'F'), 0);
      const goalsAgainst = parseIntSafe(getField(row, 'GA', 'GOALS AGAINST', 'A'), 0);

      const gdStr = getField(row, 'GD', 'GOAL DIFFERENCE', 'DIFF');
      const goalDifference = gdStr !== '' ? parseIntSafe(gdStr, goalsFor - goalsAgainst) : goalsFor - goalsAgainst;

      const ptsStr = getField(row, 'PTS', 'POINTS', 'PT');
      const points = ptsStr !== '' ? parseIntSafe(ptsStr, won * 3 + drawn) : won * 3 + drawn;

      const ppgStr = getField(row, 'PPG', 'POINTS PER GAME');
      const pointsPerGame =
        ppgStr !== ''
          ? Number(parseFloatSafe(ppgStr, 0).toFixed(2))
          : played > 0
          ? Number((points / played).toFixed(2))
          : 0;

      const formStr = getField(row, 'FORM', 'LAST 5');
      const formChars = formStr
        .toUpperCase()
        .replace(/[^WDL]/g, '')
        .split('')
        .slice(-5) as ('W' | 'D' | 'L')[];

      const isDeAnza = /de\s*anza|force/i.test(teamName);
      const existingMatch = fallbackStandings.find(
        (s) =>
          s.teamName.toLowerCase() === teamName.toLowerCase() ||
          (isDeAnza && (s.isCurrentTeam || s.isForce || /de\s*anza|force/i.test(s.teamName)))
      );

      return {
        rank,
        teamName,
        played,
        gamesPlayed: played,
        won,
        wins: won,
        lost,
        losses: lost,
        drawn,
        draws: drawn,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        pointsPerGame,
        form: formChars,
        isCurrentTeam: isDeAnza,
        isForce: isDeAnza,
        qualification:
          existingMatch?.qualification && existingMatch.qualification !== 'n/a'
            ? existingMatch.qualification
            : rank <= 4
            ? 'ECNL National Playoffs Zone'
            : 'NorCal Conference',
      };
    })
    .filter((item): item is StandingTeam => item !== null);

  return mapped.length > 0 ? mapped : fallbackStandings;
}

/**
 * Maps the `schedule` array from the Google Apps Script JSON payload into `Match[]`.
 */
export function mapEcnlApiSchedule(
  rawSchedule: EcnlApiScheduleRow[] | undefined,
  fallbackMatches: Match[]
): Match[] {
  if (!Array.isArray(rawSchedule) || rawSchedule.length === 0) {
    return sortMatchesByDate(fallbackMatches);
  }

  const mapped: Match[] = rawSchedule
    .map((row, index): Match | null => {
      if (!row || typeof row !== 'object') return null;

      const gmNum = getField(row, 'GM#', 'GM', 'GAME#', 'ID', 'MATCH ID');
      const rawDate = getField(row, 'DATE', 'MATCH DATE');
      let normalizedDate = normalizeMatchDateString(rawDate);
      const time = getField(row, 'TIME', 'KICKOFF') || 'TBD';
      const competition = (getField(row, 'COMPETITION', 'LEAGUE') ||
        'ECNL Northern California') as MatchCompetition;

      const homeAwayRaw = getField(row, 'HOME/AWAY', 'HOME AWAY', 'LOCATION TYPE').toUpperCase();
      const matchupRaw = getField(row, 'MATCHUP', 'FIXTURE');
      const isHome =
        homeAwayRaw === 'HOME'
          ? true
          : homeAwayRaw === 'AWAY'
          ? false
          : !matchupRaw.toLowerCase().includes(' at ');

      let opponent = getField(row, 'OPPONENT', 'AWAY TEAM', 'OPPOSING TEAM');
      if (!opponent && matchupRaw) {
        opponent = matchupRaw
          .replace(/^de\s*anza\s*force\s*(vs\.?|at|v\.?)\s*/i, '')
          .trim();
      }
      if (!opponent) return null;

      const matchId = gmNum
        ? gmNum.startsWith('m')
          ? gmNum
          : `m${gmNum.replace(/^#/, '')}`
        : `m-ecnl-${index + 1}`;

      // Look up any existing hardcoded match to preserve rich metadata (address, livestream URL, notes)
      const fallbackMatch = fallbackMatches.find(
        (m) =>
          m.id === matchId ||
          (normalizedDate &&
            m.date === normalizedDate &&
            m.opponent.toLowerCase().includes(opponent.toLowerCase().slice(0, 8)))
      );

      const venue = getField(row, 'VENUE', 'FIELD', 'LOCATION') || fallbackMatch?.venue || 'TBD';
      const kit = getField(row, 'KIT', 'JERSEY', 'UNIFORM');

      const gfVal = parseOptionalInt(getField(row, 'GF', 'GOALS FOR', 'TEAM SCORE'));
      const gaVal = parseOptionalInt(getField(row, 'GA', 'GOALS AGAINST', 'OPPONENT SCORE'));
      const homeScoreVal = parseOptionalInt(getField(row, 'HOME SCORE', 'HOMESCORE'));
      const awayScoreVal = parseOptionalInt(getField(row, 'AWAY SCORE', 'AWAYSCORE'));
      const scoreDisplay = getField(row, 'SCORE DISPLAY', 'SCORE');

      let teamScore: number | undefined = gfVal;
      let opponentScore: number | undefined = gaVal;

      if (teamScore === undefined || opponentScore === undefined) {
        if (homeScoreVal !== undefined && awayScoreVal !== undefined) {
          teamScore = isHome ? homeScoreVal : awayScoreVal;
          opponentScore = isHome ? awayScoreVal : homeScoreVal;
        } else if (scoreDisplay) {
          const scoreMatch = scoreDisplay.match(/(\d+)\s*[-–:]\s*(\d+)/);
          if (scoreMatch) {
            teamScore = Number.parseInt(scoreMatch[1], 10);
            opponentScore = Number.parseInt(scoreMatch[2], 10);
          }
        }
      }

      const statusRaw = getField(row, 'STATUS', 'MATCH STATUS').toLowerCase();
      const resultRaw = getField(row, 'RESULT').toUpperCase();

      let status: MatchStatus = 'upcoming';
      if (
        statusRaw === 'completed' ||
        statusRaw === 'final' ||
        statusRaw === 'ft' ||
        ((resultRaw === 'W' || resultRaw === 'D' || resultRaw === 'L') &&
          teamScore !== undefined &&
          opponentScore !== undefined)
      ) {
        status = 'completed';
      } else if (statusRaw === 'live' || statusRaw === 'in progress') {
        status = 'live';
      } else {
        status = 'upcoming';
      }

      // If GM# 1094723 (Away at Santa Rosa United) still reports its pre-reschedule Oct 2026 date while unplayed,
      // place it in March 2027 where it was rescheduled.
      if (
        (matchId === 'm1094723' || (!isHome && /santa\s*rosa/i.test(opponent))) &&
        status !== 'completed' &&
        normalizedDate.startsWith('2026-10')
      ) {
        normalizedDate = '2027-03-27';
      }

      const address =
        fallbackMatch?.address ||
        (venue.toLowerCase().includes('john mise')
          ? '1125 Saratoga Ave, Cupertino, CA 95129'
          : `${venue}, Northern California`);

      const mapUrl =
        fallbackMatch?.mapUrl && (!venue || venue === fallbackMatch.venue)
          ? fallbackMatch.mapUrl
          : `https://maps.google.com/?q=${encodeURIComponent(venue + ' CA')}`;

      return {
        ...fallbackMatch,
        id: matchId,
        date: normalizedDate || rawDate,
        time,
        competition,
        isHome,
        opponent,
        venue,
        address,
        mapUrl,
        status,
        teamScore: status === 'completed' ? (teamScore ?? 0) : undefined,
        opponentScore: status === 'completed' ? (opponentScore ?? 0) : undefined,
        homeKitColor: isHome && kit ? kit : fallbackMatch?.homeKitColor || 'Blue / Red Accents',
        awayKitColor: !isHome && kit ? kit : fallbackMatch?.awayKitColor || 'Black',
        videoLiveStreamUrl:
          fallbackMatch?.videoLiveStreamUrl || 'https://youtube.com/@TheECNL/streams',
      };
    })
    .filter((item): item is Match => item !== null);

  if (mapped.length === 0) {
    return sortMatchesByDate(fallbackMatches);
  }

  return sortMatchesByDate(mapped);
}

/**
 * Selects the Next Fixture Spotlight match from the schedule.
 * Always orders matches chronologically by calendar date and selects the earliest upcoming match
 * after the latest completed match date (and on or after today).
 */
export function selectNextFixtureMatch(matches: Match[]): Match | undefined {
  if (!Array.isArray(matches) || matches.length === 0) return undefined;

  const sorted = sortMatchesByDate(matches);

  const liveMatch = sorted.find((m) => m.status === 'live');
  if (liveMatch) return liveMatch;

  const upcoming = sorted.filter((m) => m.status === 'upcoming');
  if (upcoming.length > 0) {
    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    // Also find the latest completed match date so any unplayed past-date match
    // earlier than the most recently completed fixture is never treated as the next upcoming match.
    const completedDates = sorted
      .filter((m) => m.status === 'completed' && /^\d{4}-\d{2}-\d{2}$/.test(m.date))
      .map((m) => m.date);
    const latestCompletedIso =
      completedDates.length > 0 ? completedDates[completedDates.length - 1] : '';

    const effectiveCutoffIso =
      latestCompletedIso && latestCompletedIso > todayIso ? latestCompletedIso : todayIso;

    const futureUpcoming = upcoming.filter((m) => m.date >= effectiveCutoffIso);
    if (futureUpcoming.length > 0) {
      return futureUpcoming[0];
    }
    return upcoming[0];
  }

  return sorted[sorted.length - 1] || sorted[0];
}

/**
 * Synchronizes TeamInfo season metrics & recent form with the live standings and schedule.
 */
export function buildTeamInfoFromLiveEcnl(
  currentInfo: TeamInfo,
  standings: StandingTeam[],
  matches: Match[],
  updatedAt?: string
): TeamInfo {
  const deAnzaRow = standings.find(
    (t) => t.isCurrentTeam || t.isForce || /de\s*anza|force/i.test(t.teamName)
  );

  const completedMatches = matches.filter((m) => m && m.status === 'completed');
  const cleanSheets = completedMatches.filter((m) => (m.opponentScore ?? 0) === 0).length;

  if (!deAnzaRow) {
    return {
      ...currentInfo,
      lastStandingsSheetSyncAt: updatedAt || new Date().toISOString(),
      lastEcnlSyncAt: updatedAt || new Date().toISOString(),
    };
  }

  const form =
    deAnzaRow.form && deAnzaRow.form.length > 0
      ? deAnzaRow.form
      : currentInfo.recentForm || [];

  return {
    ...currentInfo,
    seasonRecord: {
      ...currentInfo.seasonRecord,
      wins: deAnzaRow.won,
      losses: deAnzaRow.lost,
      draws: deAnzaRow.drawn,
      goalsFor: deAnzaRow.goalsFor,
      goalsAgainst: deAnzaRow.goalsAgainst,
      cleanSheets: cleanSheets > 0 ? cleanSheets : currentInfo.seasonRecord?.cleanSheets || 0,
      norcalRank: deAnzaRow.rank || currentInfo.seasonRecord?.norcalRank || 1,
    },
    recentForm: form,
    recentFormStat: `${deAnzaRow.pointsPerGame.toFixed(2)} PPG • #${deAnzaRow.rank} NorCal`,
    lastStandingsSheetSyncAt: updatedAt || new Date().toISOString(),
    lastEcnlSyncAt: updatedAt || new Date().toISOString(),
  };
}

/**
 * Fetches live ECNL Northern California U16 standings & schedule from the Google Apps Script Web App API.
 */
export async function fetchLiveEcnlDataFromApi(
  apiUrl: string = ECNL_DATA_API_URL
): Promise<EcnlApiPayload> {
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as EcnlApiPayload;
    return data;
  } catch (directError) {
    // Fallback to backend proxy if browser blocks cross-origin redirect
    const proxyRes = await fetch('/api/ecnl/live-data', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!proxyRes.ok) {
      throw directError;
    }
    return (await proxyRes.json()) as EcnlApiPayload;
  }
}
