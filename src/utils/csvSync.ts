import Papa from 'papaparse';
import type { Player, Match, StandingTeam, PositionCategory, MatchCompetition, MatchStatus } from '../types';
import { DEFAULT_PLAYER_PHOTO, IMGUR_HEADSHOTS } from './imageUtils';
import { getValidVideoUrl, getValidInstagramUrl } from './urlUtils';

function resolvePlayerPhoto(name: string, photoFromCsv?: string, existingPhoto?: string): string {
  if (photoFromCsv && (photoFromCsv.startsWith('http://') || photoFromCsv.startsWith('https://') || photoFromCsv.startsWith('data:')) && !photoFromCsv.includes('photos.app.goo.gl')) {
    return photoFromCsv;
  }
  if (existingPhoto && existingPhoto !== DEFAULT_PLAYER_PHOTO && existingPhoto.trim() !== '') {
    return existingPhoto;
  }
  const firstName = (name || '').split(' ')[0].toLowerCase().trim();
  if (IMGUR_HEADSHOTS[firstName]) {
    return IMGUR_HEADSHOTS[firstName].url;
  }
  return existingPhoto || DEFAULT_PLAYER_PHOTO;
}

export interface PlayerFieldChange {
  field: string;
  label: string;
  before: string;
  after: string;
}

export interface PlayerDiffRecord {
  playerId: string;
  jerseyNumber: number;
  name: string;
  status: 'new' | 'updated' | 'unchanged';
  changes: PlayerFieldChange[];
}

export interface RosterParseResult {
  players: Player[];
  matchedCount: number;
  newCount: number;
  updatedWithChangesCount: number;
  diffs: PlayerDiffRecord[];
  errors: string[];
  warnings: string[];
  columnsFound: string[];
}

export interface ScheduleParseResult {
  matches: Match[];
  newCount: number;
  updatedCount: number;
  errors: string[];
  warnings: string[];
}

export interface StandingsParseResult {
  standings: StandingTeam[];
  teamCount: number;
  forceTeam?: StandingTeam;
  errors: string[];
  warnings: string[];
  columnsFound: string[];
}

// Convert various Google Sheet URLs to a direct CSV export endpoint
export function normalizeGoogleSheetUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.includes('docs.google.com/spreadsheets')) {
    return trimmed;
  }

  // Extract spreadsheet ID
  const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) return trimmed;
  const sheetId = idMatch[1];

  // Extract gid (tab ID) if present
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0';

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

// Guess primary position category
export function detectPositionCategory(pos: string): PositionCategory {
  const p = (pos || '').toLowerCase();
  if (p.includes('gk') || p.includes('goal') || p.includes('keeper')) return 'Goalkeeper';
  if (p.includes('def') || p.includes('cb') || p.includes('lb') || p.includes('rb') || p.includes('back') || p.includes('ob')) return 'Defender';
  if (p.includes('mid') || p.includes('cm') || p.includes('am') || p.includes('dm') || (p.includes('winger') && p.includes('mid'))) return 'Midfielder';
  return 'Forward';
}

/**
 * Normalizes header keys to standard property names.
 * Note: Checks 'email' / 'contact' BEFORE 'flyer' / 'pdf' so headers like
 * "Contact Info for the Flyer" map cleanly to contactEmail instead of profileDocUrl.
 */
function normalizeHeaderName(header: string): string {
  const cleaned = header.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (cleaned.includes('jersey') || cleaned.includes('uniform') || ['number', 'no', 'num', 'jerseynumber'].includes(cleaned)) return 'jerseyNumber';
  if (cleaned.includes('firstname') || cleaned === 'first') return 'firstName';
  if (cleaned.includes('lastname') || cleaned === 'last') return 'lastName';
  if ((cleaned.includes('name') || cleaned.includes('athlete')) && !cleaned.includes('school')) return 'name';
  if (cleaned.includes('specificposition') || cleaned.includes('positiontitle') || cleaned.includes('subposition') || cleaned === 'role') return 'specificPosition';
  if (cleaned.includes('position')) return 'primaryPosition';
  if (cleaned.includes('height') || cleaned === 'ht') return 'height';
  if (cleaned.includes('weight') || cleaned === 'wt') return 'weight';
  if (cleaned.includes('gpa')) return 'gpa';
  if (cleaned.includes('grad')) return 'gradYear';
  if (cleaned.includes('birth') || cleaned === 'dob') return 'birthday';
  if (cleaned.includes('school') || cleaned === 'hs') return 'highSchool';
  // Check email / contact info BEFORE flyer/pdf so "Contact Info for the Flyer" maps to contactEmail
  if (cleaned.includes('email') || cleaned.includes('contactinfo') || cleaned === 'contact') return 'contactEmail';
  if (cleaned.includes('phone') || cleaned === 'cell' || cleaned === 'mobile') return 'phone';
  if (cleaned.includes('pdf') || cleaned.includes('flyer') || cleaned.includes('playerprofile') || (cleaned.includes('profile') && (cleaned.includes('link') || cleaned.includes('doc') || cleaned.includes('url')))) return 'profileDocUrl';
  if (cleaned.includes('video') || cleaned.includes('highlight') || cleaned.includes('hudl') || cleaned.includes('veo')) return 'highlightsUrl';
  if (cleaned.includes('commit') || cleaned.includes('college')) return 'commitment';
  if (cleaned.includes('ncaa') || cleaned.includes('eligibility')) return 'ncaaId';
  if (cleaned.includes('instagram') || cleaned === 'ig' || cleaned.includes('handle')) return 'instagram';
  if (cleaned.includes('foot')) return 'dominantFoot';
  if (cleaned.includes('bio')) return 'bio';
  if (cleaned.includes('photo') || cleaned.includes('headshot') || cleaned.includes('image')) return 'photoUrl';
  if (cleaned.includes('captain')) return 'isCaptain';
  if (cleaned.includes('honor') || cleaned.includes('accolade') || cleaned.includes('award')) return 'awards';

  return header;
}

/**
 * Computes field-level differences between an existing Player and an updated Player
 */
export function computePlayerChanges(existing: Player, updated: Player): PlayerFieldChange[] {
  const fieldsToCompare: Array<{ key: keyof Player; label: string }> = [
    { key: 'jerseyNumber', label: 'Jersey #' },
    { key: 'name', label: 'Name' },
    { key: 'primaryPosition', label: 'Category' },
    { key: 'specificPosition', label: 'Position' },
    { key: 'gradYear', label: 'Grad Year' },
    { key: 'birthday', label: 'DOB' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' },
    { key: 'gpa', label: 'GPA' },
    { key: 'highSchool', label: 'High School' },
    { key: 'contactEmail', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'commitment', label: 'Commitment' },
    { key: 'highlightsUrl', label: 'Video URL' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'profileDocUrl', label: 'Profile Flyer' },
    { key: 'ncaaId', label: 'NCAA ID' },
  ];

  const changes: PlayerFieldChange[] = [];
  for (const { key, label } of fieldsToCompare) {
    const beforeVal = String(existing[key] ?? '').trim();
    const afterVal = String(updated[key] ?? '').trim();
    if (beforeVal !== afterVal && (beforeVal !== '' || afterVal !== '')) {
      changes.push({
        field: String(key),
        label,
        before: beforeVal || '—',
        after: afterVal || '—',
      });
    }
  }
  return changes;
}

/**
 * Parses raw CSV text into Player objects with fuzzy column mapping,
 * rightmost duplicate-column precedence (Height, Weight, GPA), and diff tracking.
 */
export function parseRosterCSV(
  csvText: string,
  existingPlayers: Player[] = [],
  mode: 'merge' | 'replace' = 'merge'
): RosterParseResult {
  const result: RosterParseResult = {
    players: [],
    matchedCount: 0,
    newCount: 0,
    updatedWithChangesCount: 0,
    diffs: [],
    errors: [],
    warnings: [],
    columnsFound: [],
  };

  const parsed = Papa.parse<string[]>(csvText, {
    skipEmptyLines: true,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach(e => result.errors.push(`Line ${e.row}: ${e.message}`));
  }

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length < 2) {
    result.errors.push('CSV appears to be empty or has no data rows.');
    return result;
  }

  // Find the header row: Look for row containing "name", "jersey", or "player"
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const rowStr = rawRows[i].join(' ').toLowerCase();
    if (rowStr.includes('jersey') || rowStr.includes('name') || rowStr.includes('position') || rowStr.includes('player')) {
      headerRowIndex = i;
      break;
    }
  }

  const headerRow = rawRows[headerRowIndex];
  const mappedHeaders = headerRow.map(h => normalizeHeaderName((h || '').trim()));
  result.columnsFound = headerRow.filter(Boolean);

  const existingMapByJersey = new Map<number, Player>();
  const existingMapByName = new Map<string, Player>();
  existingPlayers.forEach(p => {
    if (p.jerseyNumber !== undefined) existingMapByJersey.set(p.jerseyNumber, p);
    if (p.name) existingMapByName.set(p.name.trim().toLowerCase(), p);
  });

  const parsedPlayers: Player[] = [];
  const processedPlayerIds = new Set<string>();

  // Columns where rightmost non-empty duplicate column should win (e.g. updated Height, Weight, GPA)
  const rightmostPrecedenceKeys = new Set([
    'height',
    'weight',
    'gpa',
    'gradYear',
    'birthday',
    'highSchool',
    'contactEmail',
    'phone',
    'profileDocUrl',
    'highlightsUrl',
    'commitment',
    'ncaaId',
    'instagram',
    'dominantFoot',
    'photoUrl',
  ]);

  for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row.length === 0 || row.every(c => !c || c.trim() === '')) continue;

    const rowObj: Record<string, string> = {};
    mappedHeaders.forEach((key, colIdx) => {
      const val = row[colIdx] ? row[colIdx].trim() : '';
      if (!val || val.toLowerCase() === 'na' || val.toLowerCase() === 'n/a') return;

      if (!rowObj[key] || rightmostPrecedenceKeys.has(key)) {
        rowObj[key] = val;
      }
    });

    // Extract Jersey
    let jersey = parseInt(rowObj.jerseyNumber || '', 10);
    if (isNaN(jersey)) {
      jersey = 0;
    }

    // Extract Name
    let name = rowObj.name || '';
    if (!name && (rowObj.firstName || rowObj.lastName)) {
      name = `${rowObj.firstName || ''} ${rowObj.lastName || ''}`.trim();
    }
    if (!name) {
      if (jersey > 0) {
        name = `Player #${jersey}`;
      } else {
        continue; // Skip row without name and jersey
      }
    }

    // Clean GPA
    let gpa = rowObj.gpa || '';
    if (gpa) {
      const gpaNum = parseFloat(gpa);
      if (!isNaN(gpaNum)) {
        gpa = gpaNum.toFixed(2);
      }
    }

    // Clean Height (normalize 5""6"" or 5"6" or 5’2” -> 5'6")
    let height = rowObj.height || '';
    height = height
      .replace(/""/g, '"')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/^([456])"(\d{1,2})"?$/, "$1'$2\"");

    // Clean Weight
    let weight = rowObj.weight || '';
    if (weight && !weight.toLowerCase().includes('lb')) {
      weight = `${weight} lbs`;
    }

    // Find existing player if merge mode: match by Name first, then fallback to Jersey #
    let existing: Player | undefined;
    if (mode === 'merge') {
      const cleanName = name.toLowerCase().trim();
      if (cleanName && existingMapByName.has(cleanName)) {
        existing = existingMapByName.get(cleanName);
      } else if (jersey > 0 && existingMapByJersey.has(jersey) && !processedPlayerIds.has(existingMapByJersey.get(jersey)!.id)) {
        existing = existingMapByJersey.get(jersey);
      }
    }

    const pos = rowObj.primaryPosition || rowObj.specificPosition || existing?.primaryPosition || 'Midfielder';
    const primaryPos = detectPositionCategory(pos);

    const incomingDocVal = rowObj.profileDocUrl || '';
    const isIncomingDocValidUrl =
      incomingDocVal.startsWith('http://') ||
      incomingDocVal.startsWith('https://') ||
      incomingDocVal.startsWith('data:') ||
      incomingDocVal.startsWith('/');

    if (existing) {
      result.matchedCount++;
      processedPlayerIds.add(existing.id);

      const resolvedPdfUrl = isIncomingDocValidUrl
        ? incomingDocVal
        : existing.profilePdfUrl || (existing.profileDocUrl && (existing.profileDocUrl.startsWith('http') || existing.profileDocUrl.startsWith('data:')) ? existing.profileDocUrl : '');

      const validIncomingVideo = getValidVideoUrl(rowObj.highlightsUrl);
      const validExistingVideo = getValidVideoUrl(existing.highlightsUrl);
      const validIncomingIg = getValidInstagramUrl(rowObj.instagram);
      const validExistingIg = getValidInstagramUrl(existing.instagram);

      const mergedPlayer: Player = {
        ...existing,
        name: name || existing.name,
        jerseyNumber: jersey > 0 ? jersey : existing.jerseyNumber,
        primaryPosition: rowObj.primaryPosition ? primaryPos : existing.primaryPosition,
        specificPosition: rowObj.specificPosition || (rowObj.primaryPosition ? pos : existing.specificPosition),
        gradYear: parseInt(rowObj.gradYear, 10) || existing.gradYear || 2028,
        birthYear: parseInt(rowObj.birthYear, 10) || existing.birthYear,
        birthday: rowObj.birthday || existing.birthday,
        height: height || existing.height || '5\'6"',
        weight: weight || existing.weight || '120 lbs',
        dominantFoot: (rowObj.dominantFoot as any) || existing.dominantFoot || 'Right',
        highSchool: rowObj.highSchool || existing.highSchool || 'Bay Area High School',
        gpa: gpa || existing.gpa || '4.00',
        contactEmail: rowObj.contactEmail || existing.contactEmail,
        phone: rowObj.phone || existing.phone,
        profileDocUrl: incomingDocVal || existing.profileDocUrl,
        profilePdfUrl: resolvedPdfUrl,
        highlightsUrl: validIncomingVideo || validExistingVideo || '',
        commitment: rowObj.commitment || existing.commitment || 'Uncommitted',
        ncaaId: rowObj.ncaaId || existing.ncaaId,
        instagram: validIncomingIg || validExistingIg || '',
        isCaptain: rowObj.isCaptain !== undefined ? (rowObj.isCaptain.toLowerCase() === 'true' || rowObj.isCaptain === '1') : existing.isCaptain,
        bio: rowObj.bio || existing.bio,
        photoUrl: resolvePlayerPhoto(name, rowObj.photoUrl, existing.photoUrl),
      };

      const changes = computePlayerChanges(existing, mergedPlayer);
      if (changes.length > 0) {
        result.updatedWithChangesCount++;
      }
      result.diffs.push({
        playerId: mergedPlayer.id,
        jerseyNumber: mergedPlayer.jerseyNumber,
        name: mergedPlayer.name,
        status: changes.length > 0 ? 'updated' : 'unchanged',
        changes,
      });

      parsedPlayers.push(mergedPlayer);
    } else {
      result.newCount++;
      const newPlayer: Player = {
        id: `p_${Date.now()}_${i}`,
        name,
        jerseyNumber: jersey || parsedPlayers.length + 1,
        primaryPosition: primaryPos,
        specificPosition: rowObj.specificPosition || pos,
        secondaryPositions: [],
        gradYear: parseInt(rowObj.gradYear, 10) || 2028,
        birthYear: parseInt(rowObj.birthYear, 10) || 2010,
        birthday: rowObj.birthday || '',
        height: height || '5\'6"',
        weight: weight || '120 lbs',
        dominantFoot: (rowObj.dominantFoot as any) || 'Right',
        highSchool: rowObj.highSchool || 'Bay Area High School',
        gpa: gpa || '4.00',
        contactEmail: rowObj.contactEmail || '',
        phone: rowObj.phone || '',
        profileDocUrl: incomingDocVal,
        profilePdfUrl: isIncomingDocValidUrl ? incomingDocVal : '',
        highlightsUrl: getValidVideoUrl(rowObj.highlightsUrl) || '',
        commitment: rowObj.commitment || 'Uncommitted',
        ncaaId: rowObj.ncaaId || '',
        instagram: getValidInstagramUrl(rowObj.instagram) || '',
        photoUrl: resolvePlayerPhoto(name, rowObj.photoUrl),
        bio: rowObj.bio || `${name} is an elite youth soccer athlete competing for De Anza Force U16G ECNL.`,
        awards: ['ECNL NorCal Candidate'],
        includeInScoutingPack: true,
        stats: {
          appearances: 0,
          starts: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          saves: 0,
          minutesPlayed: 0,
        },
      };

      result.diffs.push({
        playerId: newPlayer.id,
        jerseyNumber: newPlayer.jerseyNumber,
        name: newPlayer.name,
        status: 'new',
        changes: [
          { field: 'position', label: 'Position', before: '—', after: newPlayer.specificPosition },
          { field: 'gpa', label: 'GPA', before: '—', after: newPlayer.gpa },
          { field: 'height', label: 'Height', before: '—', after: newPlayer.height },
        ],
      });

      parsedPlayers.push(newPlayer);
    }
  }

  // If in merge mode, keep existing players that were not in the CSV
  if (mode === 'merge') {
    existingPlayers.forEach(p => {
      if (!processedPlayerIds.has(p.id)) {
        parsedPlayers.push(p);
      }
    });
  }

  // Final sort by jersey number
  parsedPlayers.sort((a, b) => (a.jerseyNumber || 0) - (b.jerseyNumber || 0));
  result.players = parsedPlayers;
  return result;
}

/**
 * Parses raw CSV text into Match fixtures
 */
export function parseScheduleCSV(csvText: string): ScheduleParseResult {
  const result: ScheduleParseResult = {
    matches: [],
    newCount: 0,
    updatedCount: 0,
    errors: [],
    warnings: [],
  };

  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach(e => result.errors.push(`Line ${e.row}: ${e.message}`));
  }

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length < 2) {
    result.errors.push('Schedule CSV appears to be empty or has no data rows.');
    return result;
  }

  // Find header row
  let headerIndex = 0;
  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const s = rawRows[i].join(' ').toLowerCase();
    if (s.includes('opponent') || s.includes('date') || s.includes('venue') || s.includes('kickoff')) {
      headerIndex = i;
      break;
    }
  }

  const headers = rawRows[headerIndex].map(h => (h || '').trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const parsedMatches: Match[] = [];

  for (let i = headerIndex + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row.length === 0 || row.every(c => !c || c.trim() === '')) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, col) => {
      rowObj[h] = row[col] ? row[col].trim() : '';
    });

    const opponent = rowObj.opponent || rowObj.team || rowObj.opponentteam || `Match Opponent ${i}`;
    const date = rowObj.date || rowObj.matchdate || new Date().toISOString().split('T')[0];
    const time = rowObj.time || rowObj.kickoff || '11:00 AM PST';
    const venue = rowObj.venue || rowObj.facility || rowObj.stadium || 'De Anza College Stadium';
    const fieldNumber = rowObj.field || rowObj.fieldnumber || 'Stadium Turf';
    const address = rowObj.address || rowObj.location || '21250 Stevens Creek Blvd, Cupertino, CA 95014';
    const mapUrl = rowObj.mapurl || rowObj.map || `https://maps.google.com/?q=${encodeURIComponent(venue + ' ' + address)}`;

    // Home or Away
    const locStr = (rowObj.homeaway || rowObj.type || rowObj.location || '').toLowerCase();
    const isHome = locStr.includes('home') || locStr === 'h' || !locStr.includes('away');

    // Score parsing
    let teamScore: number | undefined;
    let opponentScore: number | undefined;
    let status: MatchStatus = 'upcoming';

    if (rowObj.status) {
      const st = rowObj.status.toLowerCase();
      if (st.includes('comp') || st.includes('final')) status = 'completed';
      else if (st.includes('live')) status = 'live';
    }

    const rawTeamScore = rowObj.teamscore ?? rowObj.score ?? rowObj.goalsfor ?? rowObj.ourscore;
    const rawOppScore = rowObj.opponentscore ?? rowObj.opponentgoals ?? rowObj.goalsagainst ?? rowObj.theirscore;

    if (rawTeamScore !== undefined && rawTeamScore !== '') {
      teamScore = parseInt(rawTeamScore, 10);
      status = 'completed';
    }
    if (rawOppScore !== undefined && rawOppScore !== '') {
      opponentScore = parseInt(rawOppScore, 10);
      status = 'completed';
    }

    // Competition
    const compStr = rowObj.competition || rowObj.league || 'ECNL Northern California';
    let competition: MatchCompetition = 'ECNL Northern California';
    if (compStr.toLowerCase().includes('surf')) competition = 'Surf Cup';
    else if (compStr.toLowerCase().includes('showcase')) competition = 'ECNL National Showcase';
    else if (compStr.toLowerCase().includes('silver')) competition = 'SilverLakes Showcase';
    else if (compStr.toLowerCase().includes('state')) competition = 'NorCal State Cup';
    else if (compStr.toLowerCase().includes('friend')) competition = 'Friendly';

    parsedMatches.push({
      id: rowObj.id || `match_${Date.now()}_${i}`,
      date,
      time,
      opponent,
      opponentLocation: rowObj.opponentlocation || 'Bay Area, CA',
      isHome,
      competition,
      venue,
      fieldNumber,
      address,
      mapUrl,
      status,
      teamScore,
      opponentScore,
      homeKitColor: rowObj.homekitcolor || 'Royal Blue & Black',
      awayKitColor: rowObj.awaykitcolor || 'Solid Black',
      videoLiveStreamUrl: rowObj.video || rowObj.videolivestreamurl || rowObj.veo || '',
      gameNotes: rowObj.notes || rowObj.gamenotes || '',
    });

    result.newCount++;
  }

  // Sort by date ascending
  parsedMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  result.matches = parsedMatches;
  return result;
}

/**
 * Normalizes a standings header cell into a canonical field key.
 */
function normalizeStandingsHeader(header: string): string {
  const raw = (header || '').trim().toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9]/g, '');

  if (['rank', 'pos', 'position', 'place', 'standing', 'no', 'num'].includes(cleaned) || raw === '#') return 'rank';
  if (cleaned.includes('team') || cleaned.includes('club') || cleaned.includes('squad') || cleaned === 'name') return 'teamName';
  if (['mp', 'gp', 'p', 'played', 'games', 'gamesplayed', 'matches', 'matchesplayed'].includes(cleaned)) return 'played';
  if (['w', 'won', 'wins', 'win'].includes(cleaned)) return 'won';
  if (['l', 'lost', 'losses', 'loss'].includes(cleaned)) return 'lost';
  if (['d', 't', 'drawn', 'draws', 'tie', 'ties', 'tied', 'draw'].includes(cleaned)) return 'drawn';
  if (['record', 'wlt', 'wld', 'overall'].includes(cleaned)) return 'record';
  if (['gf', 'f', 'goalsfor', 'for', 'goalsscored'].includes(cleaned)) return 'goalsFor';
  if (['ga', 'a', 'goalsagainst', 'against', 'goalsallowed'].includes(cleaned)) return 'goalsAgainst';
  if (['gd', 'diff', 'goaldifference', 'goaldiff', 'plusminus'].includes(cleaned) || raw === '+/-') return 'goalDifference';
  if (['pts', 'points', 'totalpoints', 'pt', 'totpts'].includes(cleaned)) return 'points';
  if (['ppg', 'ptsgm', 'pointspergame', 'ptspergame', 'avg', 'pct', 'winpct'].includes(cleaned)) return 'pointsPerGame';
  if (['form', 'recentform', 'last5', 'streak'].includes(cleaned)) return 'form';
  if (['qual', 'qualification', 'status', 'notes'].includes(cleaned)) return 'qualification';

  return cleaned;
}

/**
 * Parses raw CSV text from a Google Sheet (or AppScript export) into StandingTeam[] for the League Table.
 * Supports both header-based CSV tables and raw ECNL / TotalGlobalSports table rows.
 */
export function parseStandingsCSV(csvText: string): StandingsParseResult {
  const result: StandingsParseResult = {
    standings: [],
    teamCount: 0,
    errors: [],
    warnings: [],
    columnsFound: [],
  };

  const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach(e => result.errors.push(`Line ${e.row}: ${e.message}`));
  }

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length === 0) {
    result.errors.push('Standings Google Sheet / CSV appears to be empty.');
    return result;
  }

  // Locate header row if one exists
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(8, rawRows.length); i++) {
    const mapped = rawRows[i].map(c => normalizeStandingsHeader(c || ''));
    const hasTeamCol = mapped.includes('teamName');
    const statColsCount = mapped.filter(m =>
      ['played', 'won', 'lost', 'drawn', 'points', 'pointsPerGame', 'goalsFor', 'goalsAgainst', 'record'].includes(m)
    ).length;
    if ((hasTeamCol && statColsCount >= 1) || statColsCount >= 3) {
      headerRowIndex = i;
      break;
    }
  }

  const teams: StandingTeam[] = [];

  if (headerRowIndex >= 0) {
    const headerRow = rawRows[headerRowIndex];
    const mappedHeaders = headerRow.map(h => normalizeStandingsHeader(h || ''));
    result.columnsFound = headerRow.filter(Boolean);

    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.every(c => !c || c.trim() === '')) continue;

      const rowObj: Record<string, string> = {};
      mappedHeaders.forEach((key, idx) => {
        if (!key) return;
        const val = row[idx] ? row[idx].trim() : '';
        if (val !== '') {
          rowObj[key] = val;
        }
      });

      // Fallback: if teamName wasn't matched by header, pick the first non-numeric string cell
      let teamName = rowObj.teamName || '';
      if (!teamName) {
        const candidate = row.find(c => c && /[a-zA-Z]{3,}/.test(c) && !/^(n\/a|w|l|d|t)$/i.test(c.trim()));
        if (candidate) teamName = candidate.trim();
      }
      if (!teamName || /^(team|club|standings|overall|total)$/i.test(teamName)) continue;

      let won = parseInt(rowObj.won ?? '', 10);
      let lost = parseInt(rowObj.lost ?? '', 10);
      let drawn = parseInt(rowObj.drawn ?? '', 10);

      // Parse W-L-D / W-L-T record string if present (e.g. "5-1-2")
      if (rowObj.record && (isNaN(won) || isNaN(lost) || isNaN(drawn))) {
        const recMatch = rowObj.record.match(/(\d+)\s*-\s*(\d+)\s*-\s*(\d+)/);
        if (recMatch) {
          won = parseInt(recMatch[1], 10);
          lost = parseInt(recMatch[2], 10);
          drawn = parseInt(recMatch[3], 10);
        }
      }

      won = isNaN(won) ? 0 : won;
      lost = isNaN(lost) ? 0 : lost;
      drawn = isNaN(drawn) ? 0 : drawn;

      let played = parseInt(rowObj.played ?? '', 10);
      if (isNaN(played) || played === 0) {
        played = won + lost + drawn;
      }

      const goalsFor = parseInt(rowObj.goalsFor ?? '0', 10) || 0;
      const goalsAgainst = parseInt(rowObj.goalsAgainst ?? '0', 10) || 0;
      let goalDifference = parseInt(rowObj.goalDifference ?? '', 10);
      if (isNaN(goalDifference)) {
        goalDifference = goalsFor - goalsAgainst;
      }

      let points = parseInt(rowObj.points ?? '', 10);
      if (isNaN(points)) {
        points = won * 3 + drawn;
      }

      let pointsPerGame = parseFloat(rowObj.pointsPerGame ?? '');
      if (isNaN(pointsPerGame)) {
        pointsPerGame = played > 0 ? Number((points / played).toFixed(2)) : 0;
      } else {
        pointsPerGame = Number(pointsPerGame.toFixed(2));
      }

      let form: ('W' | 'D' | 'L' | '-')[] = [];
      if (rowObj.form) {
        form = rowObj.form
          .toUpperCase()
          .replace(/[^WDLT-]/g, '')
          .split('')
          .map(ch => (ch === 'T' ? 'D' : (ch as 'W' | 'D' | 'L' | '-')))
          .slice(-5);
      }
      if (form.length === 0 && played === 1) {
        if (won === 1) form = ['W'];
        else if (drawn === 1) form = ['D'];
        else if (lost === 1) form = ['L'];
      }

      const isForce =
        teamName.toLowerCase().includes('force') ||
        teamName.toLowerCase().includes('de anza');

      teams.push({
        rank: parseInt(rowObj.rank ?? '', 10) || teams.length + 1,
        teamName,
        played,
        won,
        lost,
        drawn,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        pointsPerGame,
        form,
        qualification: rowObj.qualification || 'n/a',
        isCurrentTeam: isForce,
        isForce,
      });
    }
  } else {
    // Fallback for headerless sheets where rows are [Rank?, TeamName, MP, W, L, D, GF, GA, GD, PTS, PPG?]
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i].map(c => (c || '').trim()).filter(Boolean);
      if (row.length < 4) continue;
      const teamIdx = row.findIndex(c => /[a-zA-Z]{3,}/.test(c));
      if (teamIdx === -1) continue;
      const teamName = row[teamIdx];
      const nums = row
        .slice(teamIdx + 1)
        .map(c => Number(c))
        .filter(n => !isNaN(n));
      if (nums.length < 4) continue;

      const [played, won, lost, drawn, gf = 0, ga = 0] = nums;
      const gd = gf - ga;
      const points = won * 3 + drawn;
      const ppg = played > 0 ? Number((points / played).toFixed(2)) : 0;
      const isForce =
        teamName.toLowerCase().includes('force') ||
        teamName.toLowerCase().includes('de anza');

      teams.push({
        rank: teams.length + 1,
        teamName,
        played,
        won,
        lost,
        drawn,
        goalsFor: gf,
        goalsAgainst: ga,
        goalDifference: gd,
        points,
        pointsPerGame: ppg,
        form: played === 1 ? (won === 1 ? ['W'] : drawn === 1 ? ['D'] : ['L']) : [],
        qualification: 'n/a',
        isCurrentTeam: isForce,
        isForce,
      });
    }
  }

  if (teams.length === 0) {
    result.errors.push('Could not find valid league standings rows in the Google Sheet / CSV.');
    return result;
  }

  // Sort by PPG desc, Points desc, GD desc, GF desc and re-rank 1..N
  teams.sort((a, b) => {
    if (b.pointsPerGame !== a.pointsPerGame) return b.pointsPerGame - a.pointsPerGame;
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  teams.forEach((t, idx) => {
    t.rank = idx + 1;
  });

  result.standings = teams;
  result.teamCount = teams.length;
  result.forceTeam = teams.find(t => t.isCurrentTeam || t.isForce);
  return result;
}

