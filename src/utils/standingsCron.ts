import type { Player, StandingTeam, TeamInfo } from '../types';
import { normalizeGoogleSheetUrl, parseStandingsCSV, parseRosterCSV, type StandingsParseResult } from './csvSync';
import { getValidInstagramUrl, getValidVideoUrl } from './urlUtils';

/**
 * Returns the Date object corresponding to the most recent Sunday at 9:00 PM Pacific Time (America/Los_Angeles),
 * and the next upcoming Sunday at 9:00 PM Pacific Time.
 */
export function getSunday9pmPacificWindow(now: Date = new Date()): {
  lastSunday9pmPT: Date;
  nextSunday9pmPT: Date;
  nextSundayFormatted: string;
} {
  // Get current date/time components in America/Los_Angeles
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const dayOfWeek = weekdayMap[partMap.weekday] ?? 0;
  const hour = parseInt(partMap.hour || '0', 10) % 24;
  const minute = parseInt(partMap.minute || '0', 10);
  const second = parseInt(partMap.second || '0', 10);

  // Seconds elapsed since Sunday 00:00:00 PT
  const secondsSinceSundayMidnight = dayOfWeek * 86400 + hour * 3600 + minute * 60 + second;
  // Sunday 9:00 PM PT is 21 * 3600 = 75600 seconds after Sunday 00:00:00 PT
  const targetSundaySeconds = 21 * 3600;

  let secondsSinceLastSunday9pm = secondsSinceSundayMidnight - targetSundaySeconds;
  if (secondsSinceLastSunday9pm < 0) {
    secondsSinceLastSunday9pm += 7 * 86400;
  }

  const secondsUntilNextSunday9pm = 7 * 86400 - secondsSinceLastSunday9pm;

  const lastSunday9pmPT = new Date(now.getTime() - secondsSinceLastSunday9pm * 1000);
  const nextSunday9pmPT = new Date(now.getTime() + secondsUntilNextSunday9pm * 1000);

  const nextSundayFormatted = nextSunday9pmPT.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return {
    lastSunday9pmPT,
    nextSunday9pmPT,
    nextSundayFormatted,
  };
}

/**
 * Checks if the most recent Sunday 9:00 PM Pacific cron window has passed since `lastSyncedIso`.
 */
export function isSunday9pmSyncDue(lastSyncedIso?: string, now: Date = new Date()): boolean {
  if (!lastSyncedIso) return true;
  const lastSyncDate = new Date(lastSyncedIso);
  if (isNaN(lastSyncDate.getTime())) return true;
  const { lastSunday9pmPT } = getSunday9pmPacificWindow(now);
  return lastSyncDate.getTime() < lastSunday9pmPT.getTime();
}

/**
 * Fetches and parses the League Standings Google Sheet via server proxy (to avoid CORS)
 * with direct client CSV fetch fallback.
 */
export async function fetchStandingsFromGoogleSheet(sheetUrl: string): Promise<StandingsParseResult & { csvText?: string }> {
  const exportUrl = normalizeGoogleSheetUrl(sheetUrl);

  // 1. Try server-side proxy endpoint first to bypass any Google Sheets redirect CORS headers
  try {
    const resp = await fetch('/api/ecnl/sync-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetUrl: exportUrl }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.csvText) {
        const parsed = parseStandingsCSV(data.csvText);
        return { ...parsed, csvText: data.csvText };
      }
    }
  } catch {
    // Fallback to client-side fetch below
  }

  // 2. Direct client-side CSV fetch
  const directResp = await fetch(exportUrl);
  if (!directResp.ok) {
    throw new Error(`Failed to fetch Google Sheet (HTTP ${directResp.status}). Ensure the Sheet is shared as "Anyone with the link can view".`);
  }
  const csvText = await directResp.text();
  if (csvText.trim().startsWith('<!DOCTYPE html>') || csvText.includes('<html')) {
    throw new Error('Google Sheet returned an HTML login page instead of CSV. Make sure link sharing is set to "Anyone with the link can view".');
  }
  const parsed = parseStandingsCSV(csvText);
  return { ...parsed, csvText };
}

/**
 * Updates TeamInfo seasonRecord & sync timestamps from a newly synced Standings table.
 */
export function buildUpdatedTeamInfoFromStandings(
  standings: StandingTeam[],
  currentTeamInfo: TeamInfo,
  sheetUrl?: string
): TeamInfo {
  const forceRow = standings.find(
    t => t.isCurrentTeam || t.isForce || t.teamName.toLowerCase().includes('force')
  );
  const nowIso = new Date().toISOString();

  return {
    ...currentTeamInfo,
    standingsGoogleSheetUrl: sheetUrl !== undefined ? sheetUrl : currentTeamInfo.standingsGoogleSheetUrl,
    standingsCronEnabled: currentTeamInfo.standingsCronEnabled ?? true,
    lastStandingsSheetSyncAt: nowIso,
    lastEcnlSyncAt: nowIso,
    seasonRecord: forceRow
      ? {
          ...currentTeamInfo.seasonRecord,
          wins: forceRow.won,
          losses: forceRow.lost,
          draws: forceRow.drawn,
          goalsFor: forceRow.goalsFor,
          goalsAgainst: forceRow.goalsAgainst,
          norcalRank: forceRow.rank,
        }
      : currentTeamInfo.seasonRecord,
    recentForm:
      forceRow && forceRow.form && forceRow.form.length > 0
        ? forceRow.form
        : currentTeamInfo.recentForm,
  };
}

/**
 * Latest verified Roster CSV snapshot provided from the team's Google Sheet.
 */
export const LATEST_VERIFIED_ROSTER_CSV = `IsUpdated,Full Player Name,Jersey Number,Phone Number,Player Email,Primary Position Category,Specific Position Title,Graduation Year,Date of Birth,Height,Dominant Foot,High School,,GPA,College Commitment,NCAA Eligibility ID,Highlight Video URL,Instagram Profile URL,Player Profile PDF Link,Player Headshot Photo URL,Player Bio & Tactical Profile,Honors & Accolades
TRUE,Eliot Kline,1,650-703-1821,eliot.kline@gmail.com,Goalkeeper,Goalkeeper (GK),2029,7/14/2011,"5'7""",Right,Burlingame High School,,4,Uncommitted,,,Eliot Kline Instagram,Eliot Kline Player Profile,,,
TRUE,Ava Golshan,1,,avagolshana@gmail.com,Goalkeeper,Goalkeeper (GK),2029,10/07/2010,"5'9""",Right,Westmont High School ,,4,Uncommitted,,,https://www.instagram.com/avagolshangk?igsi=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr,,"If you do not have a headshot in the app already, but do have a headshot you'd like to use there, add it to this Google Photos Album: https://photos.app.goo.gl/8dg4573WBM8fhNpG6",,
TRUE,Elise Laxague,7,650-554-9404,eliselaxague11@gmail.com,Midfielder,Central Midfielder (#8/#10),2029,05/30/2011,"5'3""",Right,Burlingame High School,,,Uncommitted,,,,Elise Laxague (1).pdf,,,
FALSE,Maya Onalfo,2,,mayaonalfo@gmail.com,Goalkeeper,Goalkeeper (GK),2028,,,Right,,,,Uncommitted,,,,Maya Onalfo Profile,,,
TRUE,Faith Vrionis,3,650-480-0276,faith.vrionis@icloud.com,Defender,Center Back (#4),2029,01/10/2011,"5'11""",Right,Sacred Heart Prep,,,Uncommitted,,,,Faith Vrionis Player Profile (1).pdf,,,
TRUE,Isabella Guillebeaux,4,408-706-0452,isabella.guillebeaux@icloud.com,Defender,Center Back/ Wing Back,2028,08/01/2010,"5'10""",Right,Pioneer High School,,3.9,Uncommitted,,https://youtu.be/7lOLovMemJA?si=IJIdq-SnCQZxarlw,https://www.instagram.com/isabella.soccer_4?stkn=MXRub2p5bGpuam53OA%3D%3D&utm_source=qr,https://docs.google.com/presentation/d/12uajOBYIE45DzcvFWuI_DeR5G-2mWbbAQDpsfEQ0sNk/edit?usp=drivesdk,,,
TRUE,Breeze Longhenry,5,415-828-5384,breezelonghenry@gmail.com,Defender,Wing Back (#2),2030,09/17/2011,"5'6""",Right,Menlo School,,,Uncommitted,,,,Breeze Longhenry Profile,,,
TRUE,Quinn Mozdean,9,,quinnmp2@gmail.com,Forward,Winger/ Striker,2029,6/26/2011,"5'8""",Right,Hillbrook High School ,,4,Uncommitted,,,,Quinn Mozdean Player Profile,,,
FALSE,Ellie Tarabichi,10,,ellietarabich@gmail.com,Forward,Striker (#9),2028,,"5'6""",Right,Leland High School,,,Uncommitted,,,,Ellie Tarabichi Player Profile.pdf,,,
FALSE,Sienna Ranaweera,11,,siennaranaweera@gmail.com,Midfielder,Attacking Midfielder (#10),2029,,"5'2""",Left,,,,Uncommitted,,,,Sienna Ranaweera Player Profile,,,
TRUE,Yoonwoo Kim,12,669-899-1590,yoonrosesweet@gmail.com,Midfielder,Defensive/Central Mid (#6/8),2029,5/29/2011,"5'6""",Right,Leland High School,,,Uncommitted,,,,Yoonwoo Kim Player Profile (1).pdf,,,
TRUE,Marley Dorsey,14,669-278-5713,marleydorsey@gmail.com,Defender,Center Back (#5),2029,4/20/2011,"5'7""",Right,Leland High School,,,Uncommitted,,,,MarleyDorsey playerprofile.pdf,,,
TRUE,Meera Ramasubramanian,15,650-380-2024,meera.ramaliao@gmail.com,Defender,Outside Back (#2)/ Center Back,2029,1/20/2011,"5'4""",Right,Lynbrook High School,,3.92,Uncommitted,,,,,,,
TRUE,Ella Harris,18,(408) 913-5296,ellaharrissoccer29@gmail.com,Forward,"Winger (#7, #11) / Striker (#9) ",2029,10/17/2010,"5""6""",Right,Saint Francis High School ,,3.9,Uncommitted,,https://drive.google.com/file/d/1WcVCDyeyFs9K7fLAZa3fxKyI3fRNpMiQ/view?usp=drivesdk,,https://drive.google.com/file/d/1oC8xZg6k4kuytSAvlV6XxgxqOtKbRom-/view?usp=drivesdk,,,
TRUE,Sofia Marini,20,(650)8632100,sofiamarini2028@gmail.com,Forward,Winger/ Striker,2028,08/05/2010,5'5,Right,Burlingame High School,,3.75,Uncommitted,2607992951,https://www.youtube.com/@SofiaMarini2028,https://www.instagram.com/sofia.marini.soccer,,,,
TRUE,Mia Tally,22,408-482-1387,miatally.soccer@gmail.com,Defender,CB (#4) / Defensive Mid (#6),2029,01/08/2011,"5'8""",Right,Willow Glen High School,,3.93,Uncommitted,2609189079,,,Mia Tally #22 Player Profile.pdf,,,
TRUE,Camille Chamberlain,24,916-260-6607,mack.turf.15@gmail.com,Forward,Striker (#9)/Winger (#7),2029,03/03/2011,"5'8""",Both,Vista Del Lago High School,,,Uncommitted,,,,Mack Chamberlain Player Card.pdf,,,
TRUE,Emma Holtz,25,650-304-6799,emmaholtz25@gmail.com,Defender,Outside Back (#25),2029,03/25/2011,"5'5""",Both,Menlo Atherton High School,,3.83,Uncommitted,2602825525,,Instagram.com/emma.l.holtz/,Emma Holtz #25 (1).pdf,,,
TRUE,Sakura Kapla,26,415.650.9478,sakurakapla@gmail.com,Midfielder,"Attacking Mid/FWD (10/9,11)",2029,4/26/2011,"5'6""",Both,Sacred Heart Cathedral Prep,,,Uncommitted,,,,Sakura Kapla #26,,,
TRUE,Jessica Teixeira,28,408-220-3462,jess.teixeira10@gmail.com,Goalkeeper,Goalkeeper (GK),2029,11/14/2010,"5'5""",Right,Leland High School,,3.8,Uncommitted,,Jessica Teixeira Highlights,Jessica Teixiera Instagram,Jessica Teixeira profile July 2026.pdf,,,
TRUE,Amaya Espinoza,30,408-992-1204,amayaespinoza2029@gmail.com,Forward,"Winger (#7, #11) Striker (#9)",2029,06/28/2011,"5'11""",Right,Saint Francis High School,,3.6,Uncommitted,,https://drive.google.com/file/d/1_bGv1gW7etarJ5BQCKScr-U1MLMDV_pb/view?usp=drivesdk,https://www.instagram.com/amaya.espinoza29,,,,
TRUE,Kayla Halada,32,,Kaylahaladasoccer@gmail.com,Forward,Winger (#7),2029,06/20/2011,"5'5""",Both,Sequoia High School,,3.9,Uncommitted,,https://youtu.be/sP29FrjrxVk,,Kayla Halada Profile,,,
TRUE,Avery Richter,37,669-251-1475,avery.richter2029@gmail.com,Defender,Outside Back/Center Back,2029,09/12/2010,"5'8""",Left,Archbishop Mitty High School,,4.3,Uncommitted,,HighlightsAveryRichter,,AveryRichterProfile,,,
TRUE,Isabella Gagni,46,408-722-6687,Rgagni95037@yahoo.com,Forward,Winger (#11),2029,04/09/2011,5’2”,Right,Live Oak High School,,,Uncommitted,,,,Isabella Gagni Profile,,,
FALSE,Sadie Goldberg,49,,sadiewgoldberg@icloud.com,Forward,Winger (#11),2029,,5'5,Right,,,,Uncommitted,,,,,,,`;

/**
 * Enriches a Player[] list with any missing phone numbers, normalized heights, or cleaned URLs
 * from the latest verified Google Sheet CSV without overwriting custom photos or edits.
 */
export function enrichPlayersWithVerifiedSheet(existingPlayers: Player[]): {
  players: Player[];
  changed: boolean;
} {
  const parsed = parseRosterCSV(LATEST_VERIFIED_ROSTER_CSV, existingPlayers, 'merge');
  let changed = false;

  const byName = new Map<string, Player>();
  parsed.players.forEach(p => byName.set(p.name.trim().toLowerCase(), p));

  const updated = existingPlayers.map(p => {
    const sheetPlayer = byName.get((p.name || '').trim().toLowerCase());
    const cleanHeight = (p.height || '')
      .replace(/""/g, '"')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/^([456])"(\d{1,2})"?$/, "$1'$2\"");
    const cleanVideo = getValidVideoUrl(p.highlightsUrl) || sheetPlayer?.highlightsUrl || '';
    const cleanIg = getValidInstagramUrl(p.instagram) || sheetPlayer?.instagram || '';
    const phone = p.phone || sheetPlayer?.phone || '';

    if (
      cleanHeight !== p.height ||
      cleanVideo !== (p.highlightsUrl || '') ||
      cleanIg !== (p.instagram || '') ||
      (phone && phone !== (p.phone || ''))
    ) {
      changed = true;
      return {
        ...p,
        height: cleanHeight || p.height,
        phone,
        highlightsUrl: cleanVideo,
        instagram: cleanIg,
      };
    }
    return p;
  });

  return { players: updated, changed };
}
