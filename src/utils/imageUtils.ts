import type React from 'react';

// De Anza Force Official Club Logo (from Imgur album https://imgur.com/a/hmNIg8Y and local vector)
export const CLUB_LOGO_URL = 'https://i.imgur.com/c0qeiY4.png';
export const CLUB_LOGO_SVG = '/daf-logo.svg';

// Default player photo is the official Club Crest / Logo when no matching first-name headshot exists
export const DEFAULT_PLAYER_PHOTO = CLUB_LOGO_URL;

export const DEFAULT_COACH_PHOTO = 'https://i.imgur.com/iNiPnJD.jpeg'; // Coach Yuta Nomura from album or default

/**
 * Official Player Headshots from the verified Imgur Album: https://imgur.com/a/hmNIg8Y
 * Keyed by lowercase first name / nickname matching the filename in the album.
 */
export const IMGUR_HEADSHOTS: Record<string, { filename: string; url: string; firstName: string }> = {
  amaya: {
    filename: 'amaya.jpg',
    url: 'https://i.imgur.com/9bM3Tr1.jpeg',
    firstName: 'Amaya',
  },
  breeze: {
    filename: 'breeze.jpg',
    url: 'https://i.imgur.com/CBROqa4.jpeg',
    firstName: 'Breeze',
  },
  eliot: {
    filename: 'eliot.jpg',
    url: 'https://i.imgur.com/mnc56aF.jpeg',
    firstName: 'Eliot',
  },
  elise: {
    filename: 'elise.jpg',
    url: 'https://i.imgur.com/FAqbkxw.jpeg',
    firstName: 'Elise',
  },
  ellie: {
    filename: 'ellie.jpg',
    url: 'https://i.imgur.com/F9OMlVL.jpeg',
    firstName: 'Ellie',
  },
  emma: {
    filename: 'emma.jpg',
    url: 'https://i.imgur.com/2leh7W5.jpeg',
    firstName: 'Emma',
  },
  faith: {
    filename: 'faith.jpg',
    url: 'https://i.imgur.com/mDWC2cz.jpeg',
    firstName: 'Faith',
  },
  isabella: {
    filename: 'isabella.jpg',
    url: 'https://i.imgur.com/z82Kr8e.jpeg',
    firstName: 'Isabella',
  },
  kayla: {
    filename: 'kayla.jpg',
    url: 'https://i.imgur.com/FCXUDDf.jpeg',
    firstName: 'Kayla',
  },
  mack: {
    filename: 'mack.jpg',
    url: 'https://i.imgur.com/mEo0r5F.jpeg',
    firstName: 'Mack (Camille)',
  },
  camille: {
    filename: 'mack.jpg',
    url: 'https://i.imgur.com/mEo0r5F.jpeg',
    firstName: 'Camille',
  },
  marley: {
    filename: 'marley.jpg',
    url: 'https://i.imgur.com/OWHGLWq.jpeg',
    firstName: 'Marley',
  },
  mia: {
    filename: 'mia.jpg',
    url: 'https://i.imgur.com/AqxihGX.jpeg',
    firstName: 'Mia',
  },
  quinn: {
    filename: 'quinn.jpg',
    url: 'https://i.imgur.com/fxGV8qB.jpeg',
    firstName: 'Quinn',
  },
  sadie: {
    filename: 'sadie.jpg',
    url: 'https://i.imgur.com/IbQY6g6.jpeg',
    firstName: 'Sadie',
  },
  sakura: {
    filename: 'sakura.jpg',
    url: 'https://i.imgur.com/aTnMjDm.jpeg',
    firstName: 'Sakura',
  },
  sienna: {
    filename: 'sienna.jpg',
    url: 'https://i.imgur.com/nu130xn.jpeg',
    firstName: 'Sienna',
  },
  younwoo: {
    filename: 'younwoo.jpg',
    url: 'https://i.imgur.com/bNtd5dL.jpeg',
    firstName: 'Younwoo',
  },
  yoonwoo: {
    filename: 'younwoo.jpg',
    url: 'https://i.imgur.com/bNtd5dL.jpeg',
    firstName: 'Yoonwoo',
  },
};

/**
 * Extracts first name from player's full name, e.g. "Eliot Kline" -> "eliot"
 */
export function extractFirstName(fullName: string): string {
  if (!fullName) return '';
  const clean = fullName.trim().toLowerCase();
  const parts = clean.split(/\s+/);
  return parts[0] || '';
}

/**
 * Resolves player headshot:
 * Checks if a player has a matching headshot filename in the Imgur album (https://imgur.com/a/hmNIg8Y).
 * If no match, or if the photo is missing or an old placeholder, returns the Club Logo (DEFAULT_PLAYER_PHOTO).
 */
export function getPlayerHeadshot(playerName: string, customPhotoUrl?: string): string {
  const firstName = extractFirstName(playerName);

  // If a valid custom photo is explicitly provided by user (data URL or uploaded image)
  if (customPhotoUrl && customPhotoUrl.trim() !== '') {
    const trimmed = customPhotoUrl.trim();
    // If it's not an old generic unsplash placeholder
    if (!trimmed.includes('images.unsplash.com')) {
      return transformImageUrl(trimmed);
    }
  }

  // Check matching first name in Imgur album
  if (firstName && IMGUR_HEADSHOTS[firstName]) {
    return IMGUR_HEADSHOTS[firstName].url;
  }

  // Any player without a matching headshot in the album gets the club logo
  return CLUB_LOGO_URL;
}

/**
 * Automatically cleans and converts common cloud storage links (Google Drive, Dropbox, etc.)
 * into directly loadable image stream URLs.
 */
export function transformImageUrl(url: string): string {
  if (!url) return '';
  let cleanUrl = url.trim();

  // 1. Google Drive direct link extraction
  const gDriveMatch1 = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch1 && gDriveMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch1[1]}`;
  }

  const gDriveMatch2 = cleanUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch2 && gDriveMatch2[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch2[1]}`;
  }

  const gDriveMatch3 = cleanUrl.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch3 && gDriveMatch3[1]) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch3[1]}`;
  }

  // 2. Dropbox direct download transform
  if (cleanUrl.includes('dropbox.com')) {
    cleanUrl = cleanUrl.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
    if (!cleanUrl.includes('raw=1')) {
      cleanUrl += cleanUrl.includes('?') ? '&raw=1' : '?raw=1';
    }
    return cleanUrl;
  }

  return cleanUrl;
}

export function getSafeImageSrc(
  url?: string | null,
  fallback: string = DEFAULT_PLAYER_PHOTO
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  return transformImageUrl(url);
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_PLAYER_PHOTO
) {
  const target = e.currentTarget;
  if (target.src !== fallback) {
    target.src = fallback;
  }
}




export async function compressImage(file: File, maxWidth = 1280, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error("FileReader failed"));
        reader.readAsDataURL(file);
        return;
      }

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(new Error("Fallback FileReader failed"));
        reader.readAsDataURL(file);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.onerror = (ev) => reject(new Error("Fallback FileReader failed"));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
