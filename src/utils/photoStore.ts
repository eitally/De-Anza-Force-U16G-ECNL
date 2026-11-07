import { db, markWriteQuotaExhaustedToday, saveTeamDataToServerAndCloud } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

const lastSavedPhotoHashMap: Record<string, string> = {};
const PHOTOS_STORE_DOC = doc(db, 'deanza_team_data', 'custom_player_photos');

/**
 * Persists a player photo in localStorage, server store, and Firestore (when write quota is available)
 * with strict in-memory deduplication.
 */
export async function savePlayerPhotoToFirestore(playerId: string, photoUrl: string): Promise<void> {
  if (!playerId) return;

  // Always cache locally for instant zero-latency loading
  try {
    if (photoUrl) {
      localStorage.setItem(`daf_photo_${playerId}`, photoUrl);
    } else {
      localStorage.removeItem(`daf_photo_${playerId}`);
    }
  } catch (e) {
    console.warn("LocalStorage photo cache notice:", e);
  }

  // Deduplication check: do not write if the photo has not changed
  if (lastSavedPhotoHashMap[playerId] === photoUrl) {
    return;
  }
  lastSavedPhotoHashMap[playerId] = photoUrl;

  // Save to server store first
  await saveTeamDataToServerAndCloud({
    customPlayerPhotos: {
      ...lastSavedPhotoHashMap,
      [playerId]: photoUrl || '',
    },
  });

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    const writePromise =
      !photoUrl || photoUrl.trim() === ''
        ? updateDoc(PHOTOS_STORE_DOC, { [playerId]: deleteField() })
        : setDoc(
            PHOTOS_STORE_DOC,
            { [playerId]: photoUrl, updatedAt: Date.now() },
            { merge: true }
          );
    await Promise.race([
      writePromise,
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
 * Retrieves cached player photo from localStorage if available
 */
export function getLocalCachedPlayerPhoto(playerId: string): string | null {
  try {
    return localStorage.getItem(`daf_photo_${playerId}`);
  } catch {
    return null;
  }
}

/**
 * Loads high-res player photos once from server store and Firestore
 */
export function subscribeToPlayerPhotos(onUpdate: (photosMap: Record<string, string>) => void): () => void {
  let active = true;
  (async () => {
    const photosMap: Record<string, string> = {};
    try {
      const resp = await fetch('/api/team-data');
      if (resp.ok) {
        const json = await resp.json();
        const serverPhotos = json?.data?.customPlayerPhotos;
        if (serverPhotos && typeof serverPhotos === 'object') {
          Object.keys(serverPhotos).forEach((key) => {
            if (typeof serverPhotos[key] === 'string' && serverPhotos[key]) {
              photosMap[key] = serverPhotos[key];
              lastSavedPhotoHashMap[key] = serverPhotos[key];
            }
          });
        }
      }
    } catch {}

    try {
      const docSnap = await getDoc(PHOTOS_STORE_DOC);
      if (docSnap.exists()) {
        const data = docSnap.data();
        Object.keys(data).forEach((key) => {
          if (key !== 'updatedAt' && typeof data[key] === 'string' && data[key] && !photosMap[key]) {
            photosMap[key] = data[key];
            lastSavedPhotoHashMap[key] = data[key];
            try {
              localStorage.setItem(`daf_photo_${key}`, data[key]);
            } catch {}
          }
        });
      }
    } catch {}

    if (active && Object.keys(photosMap).length > 0) {
      onUpdate(photosMap);
    }
  })();

  return () => {
    active = false;
  };
}

/**
 * Prepares the global team data document payload by stripping out massive base64 strings
 * so the main team document always stays lightweight (<100KB) and never hits Firestore's 1MB limit.
 */
export function sanitizeGlobalDocPayload<T extends Record<string, any>>(payload: T): T {
  const cleanPayload = JSON.parse(JSON.stringify(payload));
  if (Array.isArray(cleanPayload.players)) {
    cleanPayload.players = cleanPayload.players.map((p: any) => {
      // If photoUrl is a huge data URL, do not duplicate it in the monolithic global doc
      if (typeof p.photoUrl === 'string' && p.photoUrl.startsWith('data:') && p.photoUrl.length > 20000) {
        return { ...p, photoUrl: '' };
      }
      return p;
    });
  }
  return cleanPayload;
}
