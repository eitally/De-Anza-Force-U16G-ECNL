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
  // No-op: do not disable Firestore network for the session on transient timeouts
}

/**
 * Persists partial team data to the Express server store (/api/team-data) and Firestore TEAM_DATA_DOC.
 */
export async function saveTeamDataToServerAndCloud(partialData: Record<string, any>): Promise<void> {
  // 1. Persist to server-side JSON store when running with Express backend
  try {
    await fetch('/api/team-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialData),
    });
  } catch {}

  // 2. Always write to Firestore so production Vercel and QR redirects immediately see the update
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    await Promise.race([
      setDoc(TEAM_DATA_DOC, partialData, { merge: true }),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('firestore-write-timeout')), 8000);
      }),
    ]);
  } catch (err) {
    console.warn('Firestore save notice:', err);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Loads consolidated team data from Firestore (authoritative cross-environment store) and Express server store.
 */
export async function fetchTeamDataFromServerAndCloud(): Promise<Record<string, any> | null> {
  let serverData: Record<string, any> | null = null;
  let firestoreData: Record<string, any> | null = null;

  const [serverResult, firestoreResult] = await Promise.allSettled([
    (async () => {
      const resp = await fetch('/api/team-data');
      if (resp.ok) {
        const json = await resp.json();
        if (json?.ok && json.data && Object.keys(json.data).length > 0) {
          return json.data as Record<string, any>;
        }
      }
      return null;
    })(),
    (async () => {
      const snap = await getDoc(TEAM_DATA_DOC);
      if (snap.exists()) {
        return snap.data() as Record<string, any>;
      }
      return null;
    })(),
  ]);

  if (serverResult.status === 'fulfilled') {
    serverData = serverResult.value;
  }
  if (firestoreResult.status === 'fulfilled') {
    firestoreData = firestoreResult.value;
  }

  if (!firestoreData && !serverData) return null;
  // Firestore is authoritative across live Vercel and preview; serverData fills any local-only keys
  return {
    ...(serverData || {}),
    ...(firestoreData || {}),
  };
}

