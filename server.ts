import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ECNL_STANDINGS_URL = 'https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx';
const ECNL_SCHEDULE_URL = 'https://theecnl.com/sports/2023/8/8/ECNLG_0808235238.aspx';

const NORCAL_GU16_CLUBS = [
  'MVLA',
  'San Juan SC',
  'De Anza Force',
  'Mustang SC',
  'Davis Legacy',
  'Pleasanton Rage',
  'Bay Area Surf',
  'Lamorinda SC',
  'California Odyssey SC',
  'Santa Rosa United',
  'Placer United',
  'Marin FC',
];

function matchClubName(input: string): string | null {
  const s = (input || '').toLowerCase().trim();
  if (!s) return null;
  if (s.includes('mvla') || s.includes('mountain view')) return 'MVLA';
  if (s.includes('san juan')) return 'San Juan SC';
  if (s.includes('de anza') || s.includes('force')) return 'De Anza Force';
  if (s.includes('mustang')) return 'Mustang SC';
  if (s.includes('davis')) return 'Davis Legacy';
  if (s.includes('pleasanton') || s.includes('rage')) return 'Pleasanton Rage';
  if (s.includes('bay area surf') || s === 'surf' || s.includes('ba surf')) return 'Bay Area Surf';
  if (s.includes('lamorinda')) return 'Lamorinda SC';
  if (s.includes('odyssey') || s.includes('cal odyssey')) return 'California Odyssey SC';
  if (s.includes('santa rosa')) return 'Santa Rosa United';
  if (s.includes('placer')) return 'Placer United';
  if (s.includes('marin')) return 'Marin FC';
  return null;
}

/**
 * Deterministic parser for copied/pasted ECNL / Total Global Sports standings or schedule text
 */
function parseDeterministicEcnlText(rawText: string, currentStandings: any[], currentMatches: any[]) {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const parsedStandingsMap = new Map<string, any>();
  const parsedMatchesList: any[] = [];

  for (const line of lines) {
    // Check if line looks like a match result, e.g. "2026-02-28 De Anza Force 2 - 1 Marin FC" or "02/28/2026 vs Marin FC 2-1"
    const scoreMatch = line.match(/(\d+)\s*[-–:]\s*(\d+)/);
    const dateMatch = line.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})/);

    if (dateMatch && scoreMatch) {
      let normalizedDate = dateMatch[1];
      if (normalizedDate.includes('/')) {
        const parts = normalizedDate.split('/');
        if (parts.length === 3) {
          const m = parts[0].padStart(2, '0');
          const d = parts[1].padStart(2, '0');
          const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          normalizedDate = `${y}-${m}-${d}`;
        }
      }

      // Find opponent club in line
      let opponentClub: string | null = null;
      for (const club of NORCAL_GU16_CLUBS) {
        if (club !== 'De Anza Force' && line.toLowerCase().includes(club.toLowerCase().replace(' sc', '').replace(' fc', ''))) {
          opponentClub = club;
          break;
        }
      }

      if (opponentClub) {
        const s1 = parseInt(scoreMatch[1], 10);
        const s2 = parseInt(scoreMatch[2], 10);
        const lower = line.toLowerCase();
        const forceIdx = lower.indexOf('de anza') !== -1 ? lower.indexOf('de anza') : lower.indexOf('force');
        const oppIdx = lower.indexOf(opponentClub.toLowerCase().split(' ')[0]);
        const isForceFirst = forceIdx !== -1 && oppIdx !== -1 ? forceIdx < oppIdx : !lower.includes('@');

        parsedMatchesList.push({
          date: normalizedDate,
          opponent: opponentClub,
          teamScore: isForceFirst ? s1 : s2,
          opponentScore: isForceFirst ? s2 : s1,
          status: 'completed',
        });
        continue;
      }
    }

    // Check if line looks like a standings row containing a NorCal club name and numbers
    const club = matchClubName(line);
    if (club) {
      // Extract numbers after the club name
      const clubToken = club.split(' ')[0].toLowerCase();
      const idx = line.toLowerCase().indexOf(clubToken);
      const afterClub = idx !== -1 ? line.slice(idx + club.length) : line;
      // Match W-L-D or sequences of numbers: GP W L D GF GA GD PTS PPG
      const nums = afterClub.match(/[+-]?\d+(\.\d+)?/g)?.map(Number) || [];
      // Often TGS rows have: GP, W, L, D (or W, L, T), GF, GA, GD, PTS, PPG
      if (nums.length >= 4) {
        let played = nums[0];
        let won = nums[1];
        let lost = nums[2];
        let drawn = nums[3];
        // If played != won + lost + drawn, maybe first number is W, L, D
        if (played !== won + lost + drawn && nums.length >= 3 && nums[0] + nums[1] + nums[2] <= 30) {
          won = nums[0];
          lost = nums[1];
          drawn = nums[2];
          played = won + lost + drawn;
        }
        const goalsFor = nums.length >= 6 ? nums[4] : undefined;
        const goalsAgainst = nums.length >= 6 ? nums[5] : undefined;
        const points = won * 3 + drawn;
        const ppg = played > 0 ? Number((points / played).toFixed(2)) : 0;

        parsedStandingsMap.set(club, {
          teamName: club,
          played,
          won,
          lost,
          drawn,
          goalsFor,
          goalsAgainst,
          points,
          pointsPerGame: ppg,
        });
      }
    }
  }

  return {
    parsedStandings: Array.from(parsedStandingsMap.values()),
    parsedMatches: parsedMatchesList,
  };
}

/**
 * Merges incoming standings updates and match score updates with current data
 * and recalculates rankings, points, PPG, and De Anza Force record.
 */
function reconcileStandingsAndMatches(
  currentStandings: any[],
  currentMatches: any[],
  incomingStandings: any[] = [],
  incomingMatches: any[] = []
) {
  // 1. Merge matches
  const updatedMatches = (currentMatches || []).map(m => ({ ...m }));
  let matchesUpdatedCount = 0;

  for (const inc of incomingMatches) {
    if (!inc || !inc.opponent) continue;
    const normOpp = matchClubName(inc.opponent) || inc.opponent;

    // Match by date + opponent, or by opponent if date is within 2 days
    const targetIdx = updatedMatches.findIndex(m => {
      const mOpp = matchClubName(m.opponent) || m.opponent;
      const sameDate = inc.date && m.date === inc.date;
      const sameOpp = mOpp.toLowerCase() === normOpp.toLowerCase() || m.opponent.toLowerCase().includes(normOpp.toLowerCase());
      return (sameDate && sameOpp) || (sameDate && m.competition === 'ECNL Northern California');
    });

    if (targetIdx !== -1) {
      const existing = updatedMatches[targetIdx];
      const hasNewScore =
        typeof inc.teamScore === 'number' &&
        typeof inc.opponentScore === 'number' &&
        !isNaN(inc.teamScore) &&
        !isNaN(inc.opponentScore);

      if (
        hasNewScore &&
        (existing.teamScore !== inc.teamScore ||
          existing.opponentScore !== inc.opponentScore ||
          existing.status !== 'completed')
      ) {
        updatedMatches[targetIdx] = {
          ...existing,
          teamScore: inc.teamScore,
          opponentScore: inc.opponentScore,
          status: 'completed',
        };
        matchesUpdatedCount++;
      }
    }
  }

  // 2. Compute De Anza Force's ECNL league stats directly from completed ECNL Northern California matches
  const completedEcnlMatches = updatedMatches
    .filter(
      m =>
        m.competition === 'ECNL Northern California' &&
        m.status === 'completed' &&
        typeof m.teamScore === 'number' &&
        typeof m.opponentScore === 'number'
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let forceWon = 0;
  let forceLost = 0;
  let forceDrawn = 0;
  let forceGF = 0;
  let forceGA = 0;
  const forceForm: ('W' | 'D' | 'L')[] = [];

  for (const m of completedEcnlMatches) {
    const gf = Number(m.teamScore) || 0;
    const ga = Number(m.opponentScore) || 0;
    forceGF += gf;
    forceGA += ga;
    if (gf > ga) {
      forceWon++;
      forceForm.push('W');
    } else if (gf < ga) {
      forceLost++;
      forceForm.push('L');
    } else {
      forceDrawn++;
      forceForm.push('D');
    }
  }

  const forcePlayed = forceWon + forceLost + forceDrawn;
  const forcePoints = forceWon * 3 + forceDrawn;
  const forcePPG = forcePlayed > 0 ? Number((forcePoints / forcePlayed).toFixed(2)) : 0;

  // 3. Merge 12-team NorCal GU16 Standings
  const baseStandings = (currentStandings || []).map(s => ({ ...s }));
  let standingsUpdatedCount = 0;

  for (const inc of incomingStandings) {
    if (!inc || !inc.teamName) continue;
    const canonicalName = matchClubName(inc.teamName) || inc.teamName;
    const idx = baseStandings.findIndex(
      s => (matchClubName(s.teamName) || s.teamName).toLowerCase() === canonicalName.toLowerCase()
    );

    if (idx !== -1) {
      const curr = baseStandings[idx];
      const won = typeof inc.won === 'number' ? inc.won : curr.won;
      const lost = typeof inc.lost === 'number' ? inc.lost : curr.lost;
      const drawn = typeof inc.drawn === 'number' ? inc.drawn : curr.drawn;
      const played = typeof inc.played === 'number' && inc.played >= won + lost + drawn ? inc.played : won + lost + drawn;
      const goalsFor = typeof inc.goalsFor === 'number' ? inc.goalsFor : curr.goalsFor;
      const goalsAgainst = typeof inc.goalsAgainst === 'number' ? inc.goalsAgainst : curr.goalsAgainst;
      const goalDifference = goalsFor - goalsAgainst;
      const points = won * 3 + drawn;
      const pointsPerGame = played > 0 ? Number((points / played).toFixed(2)) : 0;

      if (
        curr.played !== played ||
        curr.won !== won ||
        curr.lost !== lost ||
        curr.drawn !== drawn ||
        curr.goalsFor !== goalsFor ||
        curr.goalsAgainst !== goalsAgainst
      ) {
        standingsUpdatedCount++;
      }

      baseStandings[idx] = {
        ...curr,
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
        form: Array.isArray(inc.form) && inc.form.length > 0 ? inc.form.slice(-5) : curr.form,
      };
    }
  }

  // Ensure De Anza Force row reflects at least the completed ECNL matches in our schedule
  const forceIdx = baseStandings.findIndex(
    s => s.isCurrentTeam || s.isForce || s.teamName.toLowerCase().includes('de anza')
  );
  if (forceIdx !== -1 && forcePlayed >= baseStandings[forceIdx].played) {
    const currForce = baseStandings[forceIdx];
    if (
      currForce.played !== forcePlayed ||
      currForce.won !== forceWon ||
      currForce.lost !== forceLost ||
      currForce.drawn !== forceDrawn ||
      currForce.goalsFor !== forceGF ||
      currForce.goalsAgainst !== forceGA
    ) {
      standingsUpdatedCount++;
    }
    baseStandings[forceIdx] = {
      ...currForce,
      played: forcePlayed,
      gamesPlayed: forcePlayed,
      won: forceWon,
      wins: forceWon,
      lost: forceLost,
      losses: forceLost,
      drawn: forceDrawn,
      draws: forceDrawn,
      goalsFor: forceGF,
      goalsAgainst: forceGA,
      goalDifference: forceGF - forceGA,
      points: forcePoints,
      pointsPerGame: forcePPG,
      form: forceForm.length > 0 ? forceForm.slice(-5) : currForce.form,
    };
  }

  // Sort standings by Points Per Game (PPG) descending, then Points descending, then GD descending, then GF descending
  baseStandings.sort((a, b) => {
    const ppgDiff = (b.pointsPerGame || 0) - (a.pointsPerGame || 0);
    if (Math.abs(ppgDiff) > 0.001) return ppgDiff;
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
    if ((b.goalDifference || 0) !== (a.goalDifference || 0)) return (b.goalDifference || 0) - (a.goalDifference || 0);
    return (b.goalsFor || 0) - (a.goalsFor || 0);
  });

  const rankedStandings = baseStandings.map((team, idx) => ({
    ...team,
    rank: idx + 1,
  }));

  return {
    standings: rankedStandings,
    matches: updatedMatches,
    matchesUpdatedCount,
    standingsUpdatedCount,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ECNL Northern California GU16 Automated Sync & Extraction Route
  app.post('/api/ecnl/sync', async (req, res) => {
    try {
      const {
        rawText = '',
        currentStandings = [],
        currentMatches = [],
      } = req.body || {};

      let extractedStandings: any[] = [];
      let extractedMatches: any[] = [];
      let sourceMethod = 'schedule-reconciliation';
      let notes = '';

      // Step 1: If user provided pasted text from the ECNL page, run deterministic parser first
      if (rawText && rawText.trim().length > 0) {
        const det = parseDeterministicEcnlText(rawText, currentStandings, currentMatches);
        extractedStandings = det.parsedStandings;
        extractedMatches = det.parsedMatches;
        sourceMethod = 'smart-paste';
      }

      // Step 2: Try fetching the live ECNL pages in case static/embedded table text is present
      let fetchedHtmlSnippet = '';
      if (!rawText || rawText.trim().length === 0) {
        try {
          const [standingsRes, scheduleRes] = await Promise.allSettled([
            fetch(ECNL_STANDINGS_URL, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml',
              },
            }),
            fetch(ECNL_SCHEDULE_URL, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml',
              },
            }),
          ]);

          const htmlParts: string[] = [];
          if (standingsRes.status === 'fulfilled' && standingsRes.value.ok) {
            const text = await standingsRes.value.text();
            const articleMatch = text.match(/<div class="article-content[\s\S]{0,8000}/i);
            if (articleMatch) htmlParts.push(articleMatch[0]);
          }
          if (scheduleRes.status === 'fulfilled' && scheduleRes.value.ok) {
            const text = await scheduleRes.value.text();
            const articleMatch = text.match(/<div class="article-content[\s\S]{0,8000}/i);
            if (articleMatch) htmlParts.push(articleMatch[0]);
          }
          fetchedHtmlSnippet = htmlParts.join('\n');
        } catch (_fetchErr) {
          // Ignore network errors and proceed to Gemini / reconciliation
        }
      }

      // Step 3: If GEMINI_API_KEY is available, use Gemini to extract or search-ground ECNL NorCal GU16 updates
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && (rawText.trim().length > 0 || fetchedHtmlSnippet.length > 0)) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const promptInput = rawText.trim().length > 0
            ? `Extract the ECNL Girls Northern California GU16 (G2010) league standings and De Anza Force match scores from the following text/HTML:\n\n${rawText.slice(0, 25000)}`
            : `We are syncing the ECNL Girls Northern California Conference GU16 (G2010) standings (${ECNL_STANDINGS_URL}) and De Anza Force GU16 schedule (${ECNL_SCHEDULE_URL}).
Current known standings JSON: ${JSON.stringify(currentStandings.map((s: any) => ({ teamName: s.teamName, played: s.played, won: s.won, lost: s.lost, drawn: s.drawn, goalsFor: s.goalsFor, goalsAgainst: s.goalsAgainst })))}
Current known De Anza Force matches JSON: ${JSON.stringify(currentMatches.map((m: any) => ({ date: m.date, opponent: m.opponent, isHome: m.isHome, status: m.status, teamScore: m.teamScore, opponentScore: m.opponentScore })))}
If any updated scores or standings are present in the snippet below, extract them; otherwise return empty arrays so we preserve verified records.\nSnippet:\n${fetchedHtmlSnippet.slice(0, 6000)}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: promptInput,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  standings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        teamName: { type: Type.STRING },
                        played: { type: Type.INTEGER },
                        won: { type: Type.INTEGER },
                        lost: { type: Type.INTEGER },
                        drawn: { type: Type.INTEGER },
                        goalsFor: { type: Type.INTEGER },
                        goalsAgainst: { type: Type.INTEGER },
                      },
                      required: ['teamName', 'played', 'won', 'lost', 'drawn'],
                    },
                  },
                  matches: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                        opponent: { type: Type.STRING },
                        teamScore: { type: Type.INTEGER },
                        opponentScore: { type: Type.INTEGER },
                        status: { type: Type.STRING },
                      },
                      required: ['opponent', 'teamScore', 'opponentScore'],
                    },
                  },
                },
                required: ['standings', 'matches'],
              },
            },
          });

          if (response.text) {
            const parsedJson = JSON.parse(response.text);
            if (Array.isArray(parsedJson.standings) && parsedJson.standings.length > extractedStandings.length) {
              extractedStandings = parsedJson.standings;
              sourceMethod = rawText.trim() ? 'gemini-smart-paste' : 'gemini-live-sync';
            }
            if (Array.isArray(parsedJson.matches) && parsedJson.matches.length > extractedMatches.length) {
              extractedMatches = parsedJson.matches;
              sourceMethod = rawText.trim() ? 'gemini-smart-paste' : 'gemini-live-sync';
            }
          }
        } catch (aiErr: any) {
          notes = `AI extraction skipped: ${aiErr?.message || 'unavailable'}`;
        }
      }

      const reconciled = reconcileStandingsAndMatches(
        currentStandings,
        currentMatches,
        extractedStandings,
        extractedMatches
      );

      res.json({
        ok: true,
        sourceMethod,
        ecnlStandingsUrl: ECNL_STANDINGS_URL,
        ecnlScheduleUrl: ECNL_SCHEDULE_URL,
        syncedAt: new Date().toISOString(),
        standings: reconciled.standings,
        matches: reconciled.matches,
        matchesUpdatedCount: reconciled.matchesUpdatedCount,
        standingsUpdatedCount: reconciled.standingsUpdatedCount,
        notes,
      });
    } catch (error: any) {
      console.error('Error in /api/ecnl/sync:', error);
      res.status(500).json({
        ok: false,
        error: error?.message || 'Failed to sync ECNL data',
      });
    }
  });

  // Server-side state for weekly Sunday 9:00 PM Pacific Google Sheet Standings Cron
  let savedStandingsSheetUrl = '';
  let standingsCronEnabled = true;
  let lastServerCronSyncAt = '';
  let lastServerCronCsvText = '';
  let lastTriggeredSundayKey = '';

  function toGoogleSheetCsvExportUrl(rawUrl: string): string {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed.includes('docs.google.com/spreadsheets')) return trimmed;
    const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch || !idMatch[1]) return trimmed;
    const sheetId = idMatch[1];
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  async function fetchGoogleSheetCsvServerSide(sheetUrl: string): Promise<string> {
    const exportUrl = toGoogleSheetCsvExportUrl(sheetUrl);
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeAnzaForceECNLSync/1.0)',
        Accept: 'text/csv,text/plain,*/*',
      },
    });
    if (!response.ok) {
      throw new Error(`Google Sheet fetch returned HTTP ${response.status}`);
    }
    const text = await response.text();
    if (text.trim().startsWith('<!DOCTYPE html>') || text.includes('<html')) {
      throw new Error(
        'Google Sheet returned an HTML sign-in page instead of CSV. Set Google Sheet access to "Anyone with the link can view".'
      );
    }
    return text;
  }

  // Proxy route to fetch Google Sheet CSV (Standings, Roster, or Schedule) without browser CORS issues
  app.post('/api/ecnl/sync-sheet', async (req, res) => {
    try {
      const sheetUrl = (req.body?.sheetUrl || savedStandingsSheetUrl || '').trim();
      if (!sheetUrl) {
        res.status(400).json({ ok: false, error: 'Missing Google Sheet URL' });
        return;
      }
      const csvText = await fetchGoogleSheetCsvServerSide(sheetUrl);
      if (req.body?.saveForCron) {
        savedStandingsSheetUrl = sheetUrl;
      }
      const syncedAt = new Date().toISOString();
      lastServerCronCsvText = csvText;
      lastServerCronSyncAt = syncedAt;
      res.json({
        ok: true,
        csvText,
        syncedAt,
        sheetUrl,
      });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        error: err?.message || 'Failed to fetch Google Sheet CSV',
      });
    }
  });

  app.post('/api/ecnl/configure-cron', (req, res) => {
    if (typeof req.body?.standingsGoogleSheetUrl === 'string') {
      savedStandingsSheetUrl = req.body.standingsGoogleSheetUrl.trim();
    }
    if (typeof req.body?.standingsCronEnabled === 'boolean') {
      standingsCronEnabled = req.body.standingsCronEnabled;
    }
    res.json({
      ok: true,
      standingsGoogleSheetUrl: savedStandingsSheetUrl,
      standingsCronEnabled,
      lastServerCronSyncAt,
      schedule: '0 21 * * 0 (Every Sunday at 9:00 PM America/Los_Angeles)',
    });
  });

  app.get('/api/ecnl/cron-status', (_req, res) => {
    res.json({
      ok: true,
      standingsGoogleSheetUrl: savedStandingsSheetUrl,
      standingsCronEnabled,
      lastServerCronSyncAt,
      hasCachedCsv: Boolean(lastServerCronCsvText),
      csvText: lastServerCronCsvText || undefined,
      schedule: '0 21 * * 0 (Every Sunday at 9:00 PM America/Los_Angeles)',
    });
  });

  const ECNL_DATA_API_URL =
    'https://script.google.com/macros/s/AKfycbz1R3shf0s2xmuXxf1QqiKCAHqXl-dX7biOwj8gi8dUmNYlKlUK82QWSLY8r4ugR6TGbw/exec';

  // Server-side proxy fallback for the Google Apps Script Web App API
  app.get('/api/ecnl/live-data', async (_req, res) => {
    try {
      const response = await fetch(ECNL_DATA_API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Apps Script API returned HTTP ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({
        error: err?.message || 'Failed to fetch live ECNL data from Google Apps Script API',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
