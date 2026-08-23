import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';

const lastSavedPhotoHashMap: Record<string, string> = {};
const PHOTOS_STORE_DOC = doc(db, 'deanza_team_data', 'custom_player_photos');

/**
 * Persists a player photo in Firestore using a single consolidated document
 * with strict in-memory deduplication and local cache fallback.
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

  // Deduplication check: do not write to Firestore if the photo has not changed
  if (lastSavedPhotoHashMap[playerId] === photoUrl) {
    return;
  }
  lastSavedPhotoHashMap[playerId] = photoUrl;

  try {
    if (!photoUrl || photoUrl.trim() === '') {
      await updateDoc(PHOTOS_STORE_DOC, {
        [playerId]: deleteField(),
      });
    } else {
      await setDoc(PHOTOS_STORE_DOC, {
        [playerId]: photoUrl,
        updatedAt: Date.now()
      }, { merge: true });
    }
  } catch (err: any) {
    console.warn("Notice saving player photo to Firestore:", err?.message || err);
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
 * Subscribes to real-time updates for high-res player photos from a single Firestore document
 * (consumes 1 read instead of N collection reads)
 */
export function subscribeToPlayerPhotos(onUpdate: (photosMap: Record<string, string>) => void): () => void {
  try {
    return onSnapshot(PHOTOS_STORE_DOC, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      const photosMap: Record<string, string> = {};
      Object.keys(data).forEach((key) => {
        if (key !== 'updatedAt' && typeof data[key] === 'string' && data[key]) {
          photosMap[key] = data[key];
          lastSavedPhotoHashMap[key] = data[key];
          try {
            localStorage.setItem(`daf_photo_${key}`, data[key]);
          } catch {
            // ignore localstorage quota
          }
        }
      });
      onUpdate(photosMap);
    }, (err) => {
      console.warn("Realtime player photos listener notice:", err?.message || err);
    });
  } catch (err) {
    console.warn("Failed to attach player photos listener:", err);
    return () => {};
  }
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
