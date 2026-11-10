import type { Player, StandingTeam, TeamInfo } from '../types';
import { normalizeGoogleSheetUrl, parseStandingsCSV, parseRosterCSV, type StandingsParseResult } from './csvSync';
import { getValidDocumentUrl, getValidInstagramUrl, getValidVideoUrl } from './urlUtils';
import { getOfficialImgurHeadshotForPlayer, isLegacyOrPlaceholderHeadshot } from './imageUtils';

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
FALSE,Ava Golshan,0,408-599-9802,avagolshana@gmail.com,Goalkeeper,Goalkeeper,2029,10/07/2010,"5'9""",Right,Westmont High School,,4.00,Uncommitted,2507685371,https://www.youtube.com/watch?v=RPgYdrTXlTY,https://www.instagram.com/avagolshangk?igsi=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr,https://drive.google.com/file/d/1uqgDvO005XYY1jcn4CZI6ArtklS4AveM/view?usp=sharing,https://i.imgur.com/udRJFZp.jpeg,,
FALSE,Eliot Kline,1,650-703-1821,eliot.kline@gmail.com,Goalkeeper,Goalkeeper,2029,7/14/2011,"5'7""",Right,Burlingame High School,,4.00,Uncommitted,,,,https://drive.google.com/open?id=1JofTK8graA_6wLpzONykKTO4x-4gDdGs,https://i.imgur.com/zGthYBx.jpeg,,
FALSE,Faith Vrionis,3,650-480-0276,faith.vrionis.soccer@gmail.com,Defender,Center Back (#4),2029,01/10/2011,"5'11""",Right,Sacred Heart Prep,,4.20,Uncommitted,,,,https://drive.google.com/file/d/1cIaw_KAQvv_g8uSsSACrZX5LmmMmxiYi/view?usp=sharing,https://i.imgur.com/Tjje6ZO.jpeg,,
FALSE,Isabella Guillebeaux,4,408-706-0452,isabella.guillebeaux@icloud.com,Defender,Outside Back,2028,08/01/2010,"5'10""",Right,Pioneer High School,,3.90,Uncommitted,,https://youtu.be/7lOLovMemJA?si=IJIdq-SnCQZxarlw,https://www.instagram.com/isabella.soccer_4?stkn=MXRub2p5bGpuam53OA%3D%3D&utm_source=qr,https://docs.google.com/presentation/d/12uajOBYIE45DzcvFWuI_DeR5G-2mWbbAQDpsfEQ0sNk/edit?usp=drivesdk,https://i.imgur.com/84iAcYm.jpeg,,
FALSE,Breeze Longhenry,5,415-828-5384,breezelonghenry@gmail.com,Defender,Wing Back (#2),2030,09/17/2011,"5'6""",Right,Menlo School,,4.00,Uncommitted,,,,https://drive.google.com/file/d/18UqSPu59TBTCvAY-n8x4UCjrjA3Z-uDE/view?usp=drive_link,https://i.imgur.com/PleqXfZ.jpeg,,
FALSE,Elise Laxague,7,650-554-9404,eliselaxague11@gmail.com,Midfielder,Central Mid (#8/#10),2029,05/30/2011,"5'3""",Right,Burlingame High School,,4.00,Uncommitted,,,,https://drive.google.com/file/d/1X3k-g4DJNI8KkDukqGjrZ_PDTZCtuyxD/view?usp=sharing,https://i.imgur.com/2eU2GVy.jpeg,,
FALSE,Quinn Mozdean,9,,quinnmp2@gmail.com,Forward,Winger/ Striker,2029,6/26/2011,"5'8""",Right,Hillbrook High School,,4.00,Uncommitted,,,,https://drive.google.com/file/d/1PtSuxWrpHXqlj-RwAiGwiKiYEEIT8jxa/view?usp=drivesdk,https://i.imgur.com/nDxeOkf.jpeg,,
FALSE,Ellie Tarabichi,10,,ellietarabich@gmail.com,Forward,Striker (#9),2028,01/05/2011,"5'6""",Right,Leland High School,,4.00,Uncommitted,,,,https://drive.google.com/file/d/1ZVpM8eUMRiN0sKyZC5pIpdjJjjHgx28B/view?usp=sharing,https://i.imgur.com/smZdLLg.jpeg,,
TRUE,Sienna Ranaweera,11,669-588-3877,siennaranaweera@gmail.com,Midfielder,Attacking Mid (#10),2029,5/5/2011,"5'3""",Both,Kennedy High School,,4.17,Uncommitted,,https://www.youtube.com/watch?v=QR-mGaR64rA,,https://drive.google.com/file/d/1L5KCI0TcLNWGInmnOM_nqV7kb85t19q8/view?usp=drive_link,https://i.imgur.com/BslIpek.jpeg,,
TRUE,Yoonwoo Kim,12,669-899-1590,yoonwookim29@gmail.com,Midfielder,Midfielder (#6/8),2029,5/29/2011,"5'6""",Right,Leland High School,,4.37,Uncommitted,,,https://www.instagram.com/yoonwookim.soccer?vrfl=MnVuMGJ5Mm5tZ3Vs&utm_source=qr,https://drive.google.com/file/d/1-q0KjD0LAmsxOBP6GxmZ3WYvC4Rt_nGK/view?usp=sharing,https://i.imgur.com/46J8U7l.jpeg,,
FALSE,Marley Dorsey,14,669-278-5713,marleydorsey@gmail.com,Defender,Center Back (#5),2029,4/20/2011,"5'8""",Right,Leland High School,,4.00,Uncommitted,2605928116,https://www.youtube.com/watch?v=sOC-daoCQdg,https://www.instagram.com/marleydorsey.2029?mdxt=OXVydzMydDF0Zm5k,https://drive.google.com/file/d/1U2oqyKpHU1iaWZrM64M9w1Adye35OEpr/view?usp=sharing,https://i.imgur.com/L5YgEwy.jpeg,,
FALSE,Meera Ramasubramanian,15,650-380-2024,meera.ramaliao@gmail.com,Defender,Outside/Center Back,2029,1/20/2011,"5'4""",Right,Lynbrook High School,,3.92,Uncommitted,,https://drive.google.com/file/d/1-oBFJ4epOtbCaSxZs8PfWHvUry99cIkd/view,,https://drive.google.com/file/d/1_a620aKU6yG-rN0_fxP0jjTzM7JZuqMS/view?usp=sharing,https://i.imgur.com/sRCBiQo.jpeg,,
TRUE,Ella Harris,18,(408) 913-5296,ellaharrissoccer29@gmail.com,Forward,Winger / Striker,2029,10/17/2010,"5'6""",Right,Saint Francis High School,,3.90,Uncommitted,,https://drive.google.com/file/d/1WcVCDyeyFs9K7fLAZa3fxKyI3fRNpMiQ/view?usp=drivesdk,,https://drive.google.com/file/d/1oC8xZg6k4kuytSAvlV6XxgxqOtKbRom-/view?usp=drivesdk,https://i.imgur.com/1NYOhYH.jpeg,,
FALSE,Sofia Marini,20,(650)8632100,sofiamarini2028@gmail.com,Forward,Winger/ Striker,2028,08/05/2010,"5'5""",Right,Burlingame High School,,3.75,Uncommitted,2607992951,https://www.youtube.com/@SofiaMarini2028,https://www.instagram.com/sofia.marini.soccer,https://drive.google.com/file/d/16vyhZGxGHGxr_mzdo5vMqF0Tuw7H-A3o/view?usp=sharing,https://i.imgur.com/yFe7FeD.jpeg,,
TRUE,Mia Tally,22,408-482-1387,miatally.soccer@gmail.com,Midfielder,DMD (#6) / CB (#4),2029,01/08/2011,"5'8""",Right,Willow Glen High School,,3.93,Uncommitted,2609189079,https://www.youtube.com/watch?v=yMIAx7MiVyc,,https://drive.google.com/open?id=11iTC8dA9Q0I4gfWmrGIH5nricmZwWQ_O,https://i.imgur.com/byjHVgw.jpeg,,
FALSE,Camille Chamberlain,24,916-260-6607,mack.turf.15@gmail.com,Forward,Winger / Striker,2029,03/03/2011,"5'8""",Both,Vista Del Lago High School,,4.00,Uncommitted,,https://youtu.be/ssU56jau_hQ?si=uuTlZeVGL6rpliPW,,https://drive.google.com/file/d/1w91TCu0KVuMohLtlWMNdV_n5mUoN418u/view?usp=drivesdk,https://i.imgur.com/cAInQxB.jpeg,,
FALSE,Emma Holtz,25,650-304-6799,emmaholtz25@gmail.com,Defender,"OB (#2) / Mid (#6, #8)",2029,03/25/2011,"5'5""",Both,Menlo Atherton High School,,3.83,Uncommitted,2602825525,https://www.youtube.com/@FamilyHoltz,https://instagram.com/emma.l.holtz/,https://drive.google.com/file/d/1aXU2aaqDSccFnLZYO1EqmPuOembNwVOu/view,https://i.imgur.com/oQmrQ8c.jpeg,,
FALSE,Sakura Kapla,26,415.650.9478,sakurakapla@gmail.com,Midfielder,Attacking Mid (#10),2029,4/26/2011,"5'6""",Both,Sacred Heart Cathedral Prep,,4.17,Uncommitted,,https://www.youtube.com/@SakuraKaplasoccervids,https://www.instagram.com/sakura_kapla/,https://drive.google.com/file/d/1MTp-TEhC3sNMo4OcbggIkUJ8GRYsymzB/view?usp=sharing,https://i.imgur.com/Y0FJvHk.jpeg,,
TRUE,Jessica Teixeira,28,408-220-3462,jess.teixeira10@gmail.com,Goalkeeper,Goalkeeper,2029,11/14/2010,"5'5""",Right,Leland High School,,3.80,Uncommitted,2611220089,https://www.youtube.com/@JessicaTeixeira-GK,,https://drive.google.com/file/d/1ZdrWhRBBh__uGihC0aOpo4r8JKvtiis1/view?usp=sharing,https://i.imgur.com/5MKv5Bg.jpeg,,
FALSE,Amaya Espinoza,30,408-992-1204,amayaespinoza2029@gmail.com,Forward,Winger (#11),2029,06/28/2011,"5'11""",Right,Saint Francis High School,,3.60,Uncommitted,,https://drive.google.com/file/d/1_bGv1gW7etarJ5BQCKScr-U1MLMDV_pb/view?usp=drivesdk,https://www.instagram.com/amaya.espinoza29,,https://i.imgur.com/sOkeWd2.jpeg,,
FALSE,Kayla Halada,32,650-622-2328,Kaylahaladasoccer@gmail.com,Forward,Winger (#7),2029,06/20/2011,"5'5""",Both,Sequoia High School,,3.90,Uncommitted,,https://youtu.be/sP29FrjrxVk,,,https://i.imgur.com/MqdRdQg.jpeg,,
TRUE,Avery Richter,37,669-251-1475,avery.richter2029@gmail.com,Defender,Outside/Center Back,2029,09/12/2010,"5'8""",Left,Archbishop Mitty High School,,4.60,Uncommitted,2603844837,https://my.sportsrecruits.com/athlete/avery_richter?playlist=105197,https://www.instagram.com/averyrichterfutbol?cplk=MWZyMzQ1MHpmNHJ3MA%3D%3D&utm_source=qr,https://canva.link/s73h2xvinuyohry,https://i.imgur.com/bhrA34h.jpeg,,
TRUE,Isabella Gagni,46,408-722-6687,Rgagni95037@yahoo.com,Forward,Winger (#11),2029,04/09/2011,"5'2""",Right,Live Oak High School,,4.00,Uncommitted,,https://youtu.be/rDXD0_Obymg?si=iHdFFdqX04CUYBkf,https://www.instagram.com/isabella.gagni29/,/assets/aistudio/Isabella_Gagni_3f71e37f.png,https://i.imgur.com/nfyofPG.jpeg,,
FALSE,Sadie Goldberg,49,650-526-8100,sadiewgoldberg@icloud.com,Defender,Outside Back (#2),2029,07/16/2011,"5'5""",Right,Burlingame High School,,4.00,Uncommitted,,,,,https://i.imgur.com/njCAIUP.jpeg,,`;

/**
 * Returns true if a player is known to have departed the team and must never be shown.
 */
export function isRemovedPlayer(player?: Partial<Player> | null): boolean {
  if (!player) return true;
  const n = (player.name || '').trim().toLowerCase();
  return (
    n.includes('parker') ||
    n.includes('sasha') ||
    n.includes('anava') ||
    n.includes('onalfo') ||
    n.includes('alqudah') ||
    n.includes('alqadah')
  );
}

/**
 * Enriches a Player[] list with a Google Sheet CSV (defaulting to LATEST_VERIFIED_ROSTER_CSV)
 * and treats the Roster Sheet as the authoritative list of active players (removing anyone
 * no longer in the sheet or marked as departed).
 *
 * When called with the static default CSV (`csvText === LATEST_VERIFIED_ROSTER_CSV`),
 * fields already saved on `existingPlayers` (e.g. via the Roster Edit Modal in Firestore/localStorage)
 * take priority over the static baseline so manual edits are never overwritten on reload.
 */
export function enrichPlayersWithVerifiedSheet(
  existingPlayers: Player[],
  csvText: string = LATEST_VERIFIED_ROSTER_CSV
): {
  players: Player[];
  changed: boolean;
} {
  const isLiveSheetSync = csvText !== LATEST_VERIFIED_ROSTER_CSV;
  const parsed = parseRosterCSV(csvText, existingPlayers, 'merge');
  let changed = false;

  const byName = new Map<string, Player>();
  parsed.players.forEach(p => {
    if (!isRemovedPlayer(p)) {
      byName.set(p.name.trim().toLowerCase(), p);
    }
  });

  // Only keep players who are on the authoritative Roster Sheet (when the sheet parsed valid rows)
  const activeExisting = existingPlayers.filter(p => {
    if (isRemovedPlayer(p)) {
      changed = true;
      return false;
    }
    if (byName.size > 0 && !byName.has((p.name || '').trim().toLowerCase())) {
      changed = true;
      return false;
    }
    return true;
  });

  // Also include any brand-new players added to the Roster Sheet who were not in existingPlayers yet
  const existingNames = new Set(activeExisting.map(p => (p.name || '').trim().toLowerCase()));
  for (const [normName, sheetP] of byName.entries()) {
    if (!existingNames.has(normName)) {
      activeExisting.push(sheetP);
      existingNames.add(normName);
      changed = true;
    }
  }

  const updated = activeExisting.map(p => {
    const sheetPlayer = byName.get((p.name || '').trim().toLowerCase());
    const rawHeight = (
      isLiveSheetSync
        ? sheetPlayer?.height || p.height || ''
        : p.height || sheetPlayer?.height || ''
    ).trim();
    const cleanHeight = rawHeight
      .replace(/""/g, '"')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/^([456])"(\d{1,2})"?$/, "$1'$2\"")
      .replace(/^([456])'(\d{1,2})$/, "$1'$2\"");
    const cleanVideo = isLiveSheetSync
      ? (sheetPlayer ? getValidVideoUrl(sheetPlayer.highlightsUrl) : undefined) ||
        getValidVideoUrl(p.highlightsUrl) ||
        ''
      : getValidVideoUrl(p.highlightsUrl) ||
        (sheetPlayer ? getValidVideoUrl(sheetPlayer.highlightsUrl) : undefined) ||
        '';
    const cleanIg = isLiveSheetSync
      ? (sheetPlayer ? getValidInstagramUrl(sheetPlayer.instagram) : undefined) ||
        getValidInstagramUrl(p.instagram) ||
        (p.highlightsUrl && p.highlightsUrl.toLowerCase().includes('instagram.com')
          ? getValidInstagramUrl(p.highlightsUrl)
          : undefined) ||
        ''
      : getValidInstagramUrl(p.instagram) ||
        (sheetPlayer ? getValidInstagramUrl(sheetPlayer.instagram) : undefined) ||
        (p.highlightsUrl && p.highlightsUrl.toLowerCase().includes('instagram.com')
          ? getValidInstagramUrl(p.highlightsUrl)
          : undefined) ||
        '';

    // Legacy Google Drive link for Isabella Gagni (#46) that was replaced by her new player profile sheet
    const isOldIsabellaDriveUrl = (u?: string) =>
      Boolean(u && u.includes('1U83x2Fuensf0Vx0dQsWO66zfcbM_gHVp'));
    const existingValidDoc = isOldIsabellaDriveUrl(getValidDocumentUrl(p))
      ? '/assets/aistudio/Isabella_Gagni_3f71e37f.png'
      : getValidDocumentUrl(p);
    const sheetValidDoc = sheetPlayer ? getValidDocumentUrl(sheetPlayer) : undefined;

    const validDoc = isLiveSheetSync
      ? sheetValidDoc || existingValidDoc
      : existingValidDoc || sheetValidDoc;

    const fallbackDocLabel =
      p.profileDocUrl && !p.profileDocUrl.toLowerCase().includes('instagram.com')
        ? p.profileDocUrl
        : sheetPlayer?.profileDocUrl && !sheetPlayer.profileDocUrl.toLowerCase().includes('instagram.com')
        ? sheetPlayer.profileDocUrl
        : '';
    const nextProfilePdfUrl = validDoc || '';
    const nextProfileDocUrl = validDoc || fallbackDocLabel;
    const nextJerseyNumber = isLiveSheetSync
      ? sheetPlayer?.jerseyNumber !== undefined
        ? sheetPlayer.jerseyNumber
        : p.jerseyNumber
      : p.jerseyNumber !== undefined
      ? p.jerseyNumber
      : sheetPlayer?.jerseyNumber ?? 0;
    const nextPrimaryPosition = isLiveSheetSync
      ? sheetPlayer?.primaryPosition || p.primaryPosition
      : p.primaryPosition || sheetPlayer?.primaryPosition || 'Midfielder';
    const nextSpecificPosition = isLiveSheetSync
      ? sheetPlayer?.specificPosition || p.specificPosition || ''
      : p.specificPosition || sheetPlayer?.specificPosition || '';
    const nextGradYear = isLiveSheetSync
      ? sheetPlayer?.gradYear || p.gradYear
      : p.gradYear || sheetPlayer?.gradYear || 2029;
    const nextBirthday = isLiveSheetSync
      ? sheetPlayer?.birthday || p.birthday || ''
      : p.birthday || sheetPlayer?.birthday || '';
    const nextDominantFoot = isLiveSheetSync
      ? sheetPlayer?.dominantFoot || p.dominantFoot
      : p.dominantFoot || sheetPlayer?.dominantFoot || 'Right';
    const nextHighSchool = isLiveSheetSync
      ? sheetPlayer?.highSchool || p.highSchool || ''
      : p.highSchool || sheetPlayer?.highSchool || '';
    const nextGpa = isLiveSheetSync
      ? sheetPlayer?.gpa || p.gpa || ''
      : p.gpa || sheetPlayer?.gpa || '';
    const nextContactEmail = isLiveSheetSync
      ? sheetPlayer?.contactEmail || p.contactEmail || ''
      : p.contactEmail || sheetPlayer?.contactEmail || '';
    const nextPhone = isLiveSheetSync
      ? sheetPlayer?.phone || p.phone || ''
      : p.phone || sheetPlayer?.phone || '';
    const nextNcaaId = isLiveSheetSync
      ? sheetPlayer?.ncaaId || p.ncaaId || ''
      : p.ncaaId || sheetPlayer?.ncaaId || '';

    const officialImgurUrl = getOfficialImgurHeadshotForPlayer(p.name, nextJerseyNumber);
    const nextPhotoUrl =
      officialImgurUrl && (isLegacyOrPlaceholderHeadshot(p.photoUrl) || p.photoUrl !== officialImgurUrl)
        ? officialImgurUrl
        : p.photoUrl;

    if (
      nextJerseyNumber !== p.jerseyNumber ||
      nextPrimaryPosition !== p.primaryPosition ||
      nextSpecificPosition !== (p.specificPosition || '') ||
      nextGradYear !== p.gradYear ||
      nextBirthday !== (p.birthday || '') ||
      cleanHeight !== p.height ||
      nextDominantFoot !== p.dominantFoot ||
      nextHighSchool !== (p.highSchool || '') ||
      nextGpa !== (p.gpa || '') ||
      nextContactEmail !== (p.contactEmail || '') ||
      cleanVideo !== (p.highlightsUrl || '') ||
      cleanIg !== (p.instagram || '') ||
      nextProfilePdfUrl !== (p.profilePdfUrl || '') ||
      nextProfileDocUrl !== (p.profileDocUrl || '') ||
      nextPhone !== (p.phone || '') ||
      nextNcaaId !== (p.ncaaId || '') ||
      nextPhotoUrl !== p.photoUrl
    ) {
      changed = true;
      return {
        ...p,
        jerseyNumber: nextJerseyNumber,
        primaryPosition: nextPrimaryPosition,
        specificPosition: nextSpecificPosition,
        gradYear: nextGradYear,
        birthday: nextBirthday,
        height: cleanHeight || p.height || '',
        dominantFoot: nextDominantFoot,
        highSchool: nextHighSchool,
        gpa: nextGpa,
        contactEmail: nextContactEmail,
        phone: nextPhone,
        ncaaId: nextNcaaId,
        highlightsUrl: cleanVideo,
        instagram: cleanIg,
        profilePdfUrl: nextProfilePdfUrl,
        profileDocUrl: nextProfileDocUrl,
        photoUrl: nextPhotoUrl,
      };
    }
    return p;
  });

  return { players: updated, changed };
}

/**
 * Fetches a live Roster Google Sheet via the server proxy (which also unwraps rich-text hyperlinks)
 * and enriches the current player list with any updated URLs or profile fields.
 */
export async function fetchLiveRosterSheetAndEnrich(
  rosterSheetUrl: string,
  existingPlayers: Player[]
): Promise<{ players: Player[]; changed: boolean }> {
  const trimmed = (rosterSheetUrl || '').trim();
  if (!trimmed) return { players: existingPlayers, changed: false };
  const exportUrl = normalizeGoogleSheetUrl(trimmed);
  try {
    const resp = await fetch('/api/ecnl/sync-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetUrl: exportUrl }),
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.csvText) {
        return enrichPlayersWithVerifiedSheet(existingPlayers, data.csvText);
      }
    }
  } catch {}
  return { players: existingPlayers, changed: false };
}

