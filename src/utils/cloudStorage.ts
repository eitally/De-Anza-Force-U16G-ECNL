import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { compressHeadshot, compressImage } from './imageUtils';

export interface UploadResult {
  url: string;
  isCloudUrl: boolean;
  filename: string;
  error?: string;
}

/**
 * Uploads a player headshot to Cloud Storage with automatic compression fallback.
 */
export async function uploadPlayerHeadshot(
  playerId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  // Compress image client-side first
  const compressedDataUrl = await compressHeadshot(file);

  try {
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `player_photos/${playerId}_${Date.now()}_${cleanFilename}`);

    // Convert data URL to Blob for clean binary upload
    const res = await fetch(compressedDataUrl);
    const blob = await res.blob();

    return new Promise((resolve) => {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: blob.type || 'image/jpeg',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress && snapshot.totalBytes > 0) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(pct);
          }
        },
        (error: any) => {
          console.warn('Firebase Storage upload notice (falling back to compressed image):', error?.code || error?.message);
          resolve({
            url: compressedDataUrl,
            isCloudUrl: false,
            filename: file.name,
            error: error?.code === 'storage/unknown' || error?.code === 'storage/object-not-found'
              ? 'Firebase Storage bucket not activated yet in Firebase Console.'
              : error?.message,
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              isCloudUrl: true,
              filename: file.name,
            });
          } catch {
            resolve({
              url: compressedDataUrl,
              isCloudUrl: false,
              filename: file.name,
            });
          }
        }
      );
    });
  } catch (err: any) {
    console.warn('Direct upload error, using local compressed image:', err);
    return {
      url: compressedDataUrl,
      isCloudUrl: false,
      filename: file.name,
    };
  }
}

/**
 * Uploads a college recruitment PDF flyer / scout document.
 */
export async function uploadPlayerScoutPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `scouting_packets/${Date.now()}_${cleanFilename}`);

  try {
    return new Promise((resolve) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: 'application/pdf',
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress && snapshot.totalBytes > 0) {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(pct);
          }
        },
        (error: any) => {
          console.warn('PDF Storage upload error:', error);
          resolve({
            url: file.name, // keep filename as fallback reference
            isCloudUrl: false,
            filename: file.name,
            error: 'Firebase Storage bucket not activated. Enable Firebase Storage in your console.',
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              isCloudUrl: true,
              filename: file.name,
            });
          } catch (err: any) {
            resolve({
              url: file.name,
              isCloudUrl: false,
              filename: file.name,
              error: err?.message,
            });
          }
        }
      );
    });
  } catch (err: any) {
    return {
      url: file.name,
      isCloudUrl: false,
      filename: file.name,
      error: err?.message,
    };
  }
}
