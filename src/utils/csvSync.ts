import Papa from 'papaparse';
import type { Player, Match, PositionCategory, MatchCompetition, MatchStatus } from '../types';
import { DEFAULT_PLAYER_PHOTO, IMGUR_HEADSHOTS } from './imageUtils';

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

export interface RosterParseResult {
  players: Player[];
  matchedCount: number;
  newCount: number;
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
  if (p.includes('mid') || p.includes('cm') || p.includes('am') || p.includes('dm') || p.includes('winger') && p.includes('mid')) return 'Midfielder';
  return 'Forward';
}

/**
 * Normalizes header keys to standard property names
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
  if (cleaned.includes('email')) return 'contactEmail';
  if (cleaned.includes('phone') || cleaned === 'cell' || cleaned === 'mobile') return 'phone';
  if (cleaned.includes('pdf') || cleaned.includes('flyer') || (cleaned.includes('profile') && (cleaned.includes('link') || cleaned.includes('doc')))) return 'profileDocUrl';
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
 * Parses raw CSV text into Player objects with fuzzy column mapping and smart merge support.
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

  for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row.length === 0 || row.every(c => !c || c.trim() === '')) continue;

    const rowObj: Record<string, string> = {};
    mappedHeaders.forEach((key, colIdx) => {
      const val = row[colIdx] ? row[colIdx].trim() : '';
      // Don't overwrite if duplicate column mapped
      if (!rowObj[key] && val) {
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

    // Clean Height
    let height = rowObj.height || '';
    height = height.replace(/""/g, '"');

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

    if (existing) {
      result.matchedCount++;
      processedPlayerIds.add(existing.id);

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
        profileDocUrl: rowObj.profileDocUrl || existing.profileDocUrl,
        profilePdfUrl: rowObj.profileDocUrl || existing.profilePdfUrl || existing.profileDocUrl,
        highlightsUrl: rowObj.highlightsUrl || existing.highlightsUrl,
        commitment: rowObj.commitment || existing.commitment || 'Uncommitted',
        ncaaId: rowObj.ncaaId || existing.ncaaId,
        instagram: rowObj.instagram || existing.instagram,
        isCaptain: rowObj.isCaptain !== undefined ? (rowObj.isCaptain.toLowerCase() === 'true' || rowObj.isCaptain === '1') : existing.isCaptain,
        bio: rowObj.bio || existing.bio,
        photoUrl: resolvePlayerPhoto(name, rowObj.photoUrl, existing.photoUrl),
      };

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
        height: height || '5\'6"',
        weight: weight || '120 lbs',
        dominantFoot: (rowObj.dominantFoot as any) || 'Right',
        highSchool: rowObj.highSchool || 'Bay Area High School',
        gpa: gpa || '4.00',
        contactEmail: rowObj.contactEmail || '',
        profileDocUrl: rowObj.profileDocUrl || '',
        profilePdfUrl: rowObj.profileDocUrl || '',
        highlightsUrl: rowObj.highlightsUrl || '',
        commitment: rowObj.commitment || 'Uncommitted',
        ncaaId: rowObj.ncaaId || '',
        instagram: rowObj.instagram || '',
        photoUrl: resolvePlayerPhoto(name, rowObj.photoUrl),
        bio: rowObj.bio || `${name} is an elite youth soccer athlete competing for De Anza Force U16G ECNL.`,
        awards: ['ECNL NorCal Candidate'],
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
