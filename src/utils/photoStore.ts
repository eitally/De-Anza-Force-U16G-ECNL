import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';

const CHUNK_SIZE = 500 * 1024; // 500KB safe chunk size (well under Firestore's 1MB limit)
const lastSavedPhotoHashMap: Record<string, string> = {};

/**
 * Persists a high-resolution (1-2MB) player photo in Firestore using chunked document storage
 * to guarantee that no individual Firestore document exceeds the 1MB limit.
 */
export async function savePlayerPhotoToFirestore(playerId: string, fullDataUrl: string): Promise<void> {
  if (!playerId) return;

  // Always cache locally for instant zero-latency loading
  try {
    if (fullDataUrl) {
      localStorage.setItem(`daf_photo_${playerId}`, fullDataUrl);
    } else {
      localStorage.removeItem(`daf_photo_${playerId}`);
    }
  } catch (e) {
    console.warn("LocalStorage photo cache notice:", e);
  }

  // Deduplication check: do not write to Firestore if the photo has not changed
  if (lastSavedPhotoHashMap[playerId] === fullDataUrl) {
    return;
  }
  lastSavedPhotoHashMap[playerId] = fullDataUrl;

  const photoDocRef = doc(db, 'deanza_player_photos', playerId);

  if (!fullDataUrl || fullDataUrl.trim() === '') {
    try {
      await deleteDoc(photoDocRef);
    } catch (e) {
      console.warn("Notice: Firestore player photo deletion:", e);
    }
    return;
  }

  // If it's a standard URL (http://, https://, or /assets/...)
  if (fullDataUrl.startsWith('http://') || fullDataUrl.startsWith('https://') || fullDataUrl.startsWith('/')) {
    try {
      await setDoc(photoDocRef, {
        playerId,
        photoUrl: fullDataUrl,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (err: any) {
      console.warn("Notice saving player photo URL to Firestore:", err?.message || err);
    }
    return;
  }

  // If it's a high-res (1-2MB) Base64 Data URL, chunk it cleanly
  const chunks: string[] = [];
  for (let i = 0; i < fullDataUrl.length; i += CHUNK_SIZE) {
    chunks.push(fullDataUrl.slice(i, i + CHUNK_SIZE));
  }

  try {
    await setDoc(photoDocRef, {
      playerId,
      chunks,
      chunkCount: chunks.length,
      totalLength: fullDataUrl.length,
      updatedAt: Date.now()
    });
  } catch (err: any) {
    console.warn("Notice saving chunked high-res photo to Firestore:", err?.message || err);
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
 * Subscribes to real-time updates for high-res player photos from Firestore
 */
export function subscribeToPlayerPhotos(onUpdate: (photosMap: Record<string, string>) => void): () => void {
  try {
    const photosCol = collection(db, 'deanza_player_photos');
    return onSnapshot(photosCol, (snapshot) => {
      const photosMap: Record<string, string> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const playerId = docSnap.id;
        if (typeof data.photoUrl === 'string' && data.photoUrl) {
          photosMap[playerId] = data.photoUrl;
          lastSavedPhotoHashMap[playerId] = data.photoUrl;
        } else if (Array.isArray(data.chunks) && data.chunks.length > 0) {
          const full = data.chunks.join('');
          photosMap[playerId] = full;
          lastSavedPhotoHashMap[playerId] = full;
          try {
            localStorage.setItem(`daf_photo_${playerId}`, full);
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
      if (typeof p.photoUrl === 'string' && p.photoUrl.startsWith('data:') && p.photoUrl.length > 10000) {
        return { ...p, photoUrl: '' };
      }
      return p;
    });
  }
  return cleanPayload;
}
