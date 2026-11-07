import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  setLogLevel,
  disableNetwork,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Silence internal @firebase/firestore transport backoff console errors when free-tier daily write quota is reached
try {
  setLogLevel('silent');
} catch {}

const firebaseConfig = {
  projectId: "gen-lang-client-0890913570",
  appId: "1:660142708319:web:694e3cc25441c75f0e6dea",
  apiKey: "AIzaSyD0LwSHx0AHcdBEg0XC7rf9U2XnIU3T1Fo",
  authDomain: "gen-lang-client-0890913570.firebaseapp.com",
  storageBucket: "gen-lang-client-0890913570.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-deanzaforcesocce-67829d24-5955-4daa-965e-bbfccc815d47");
export const storage = getStorage(app);

// Single consolidated document for team state
export const TEAM_DATA_DOC = doc(db, 'deanza_force_data', 'global_team_data');

const QUOTA_EXHAUSTED_KEY = 'daf_firestore_write_quota_date';

function isWriteQuotaExhaustedToday(): boolean {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return sessionStorage.getItem(QUOTA_EXHAUSTED_KEY) === today;
  } catch {
    return false;
  }
}

export function markWriteQuotaExhaustedToday(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    sessionStorage.setItem(QUOTA_EXHAUSTED_KEY, today);
  } catch {}
  disableNetwork(db).catch(() => {});
}

/**
 * Persists partial team data to the Express server store (/api/team-data) first,
 * and best-effort syncs to Firestore only if the daily write quota has not been exhausted.
 */
export async function saveTeamDataToServerAndCloud(partialData: Record<string, any>): Promise<void> {
  // 1. Always persist to server-side JSON store (zero quota limits, shared across all sessions)
  try {
    await fetch('/api/team-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialData),
    });
  } catch {}

  // 2. Skip Firestore write if daily free-tier write quota was already reached today
  if (isWriteQuotaExhaustedToday()) {
    return;
  }

  // 3. Best-effort Firestore write with a short timeout so the SDK write queue never loops on resource-exhausted
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    await Promise.race([
      setDoc(TEAM_DATA_DOC, partialData, { merge: true }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('resource-exhausted-timeout')), 3000);
      }),
    ]);
  } catch {
    markWriteQuotaExhaustedToday();
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Loads consolidated team data from the Express server store (/api/team-data) and Firestore (one-time getDoc).
 */
export async function fetchTeamDataFromServerAndCloud(): Promise<Record<string, any> | null> {
  let serverData: Record<string, any> | null = null;
  let firestoreData: Record<string, any> | null = null;

  try {
    const resp = await fetch('/api/team-data');
    if (resp.ok) {
      const json = await resp.json();
      if (json?.ok && json.data && Object.keys(json.data).length > 0) {
        serverData = json.data;
      }
    }
  } catch {}

  if (!isWriteQuotaExhaustedToday()) {
    try {
      const snap = await getDoc(TEAM_DATA_DOC);
      if (snap.exists()) {
        firestoreData = snap.data();
      }
    } catch {}
  }

  if (!firestoreData && !serverData) return null;
  // Server store has the most recent writes when Firestore write quota is exhausted
  return {
    ...(firestoreData || {}),
    ...(serverData || {}),
  };
}

