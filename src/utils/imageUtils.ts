import type React from 'react';

// De Anza Force Official Club Logo (attached graphic)
export const CLUB_LOGO_URL = '/logo.png';
export const CLUB_LOGO_SVG = '/logo.png';

// Default player photo is the official Club Crest / Logo when no matching first-name headshot exists
export const DEFAULT_PLAYER_PHOTO = CLUB_LOGO_URL;

export const DEFAULT_COACH_PHOTO = 'https://i.imgur.com/iNiPnJD.jpeg'; // Coach Yuta Nomura from album or default

/**
 * Official Player Headshots from the updated Imgur Album: https://imgur.com/a/Gc4jn5p
 */
export const IMGUR_HEADSHOTS: Record<string, { filename: string; url: string; firstName: string; fullName?: string; jerseyNumber?: number }> = {
  ava: {
    filename: 'DSC03342_DxO-2.jpg',
    url: 'https://i.imgur.com/udRJFZp.jpeg',
    firstName: 'Ava',
    fullName: 'Ava Golshan',
    jerseyNumber: 0,
  },
  eliot: {
    filename: '1_eliot_headshot.jpg',
    url: 'https://i.imgur.com/zGthYBx.jpeg',
    firstName: 'Eliot',
    fullName: 'Eliot Kline',
    jerseyNumber: 1,
  },
  faith: {
    filename: '3_faith_headshot.jpg',
    url: 'https://i.imgur.com/Tjje6ZO.jpeg',
    firstName: 'Faith',
    fullName: 'Faith Vrionis',
    jerseyNumber: 3,
  },
  isabella_guillebeaux: {
    filename: '4_isabella_guillebeaux_headshot.jpg',
    url: 'https://i.imgur.com/84iAcYm.jpeg',
    firstName: 'Isabella (#4)',
    fullName: 'Isabella Guillebeaux',
    jerseyNumber: 4,
  },
  breeze: {
    filename: '5_breeze_headshot.jpg',
    url: 'https://i.imgur.com/PleqXfZ.jpeg',
    firstName: 'Breeze',
    fullName: 'Breeze Longhenry',
    jerseyNumber: 5,
  },
  elise: {
    filename: '7_elise_headshot.jpg',
    url: 'https://i.imgur.com/2eU2GVy.jpeg',
    firstName: 'Elise',
    fullName: 'Elise Laxague',
    jerseyNumber: 7,
  },
  quinn: {
    filename: '9_quinn_headshot.jpg',
    url: 'https://i.imgur.com/nDxeOkf.jpeg',
    firstName: 'Quinn',
    fullName: 'Quinn Mozdean',
    jerseyNumber: 9,
  },
  ellie: {
    filename: '10_ellie_headshot.jpg',
    url: 'https://i.imgur.com/smZdLLg.jpeg',
    firstName: 'Ellie',
    fullName: 'Ellie Tarabichi',
    jerseyNumber: 10,
  },
  sienna: {
    filename: '11_sienna_headshot.jpg',
    url: 'https://i.imgur.com/BslIpek.jpeg',
    firstName: 'Sienna',
    fullName: 'Sienna Ranaweera',
    jerseyNumber: 11,
  },
  yoonwoo: {
    filename: '12_yoonwoo_headshot.jpg',
    url: 'https://i.imgur.com/46J8U7l.jpeg',
    firstName: 'Yoonwoo',
    fullName: 'Yoonwoo Kim',
    jerseyNumber: 12,
  },
  younwoo: {
    filename: '12_yoonwoo_headshot.jpg',
    url: 'https://i.imgur.com/46J8U7l.jpeg',
    firstName: 'Younwoo',
    fullName: 'Yoonwoo Kim',
    jerseyNumber: 12,
  },
  marley: {
    filename: '14_marley_headshot.jpg',
    url: 'https://i.imgur.com/L5YgEwy.jpeg',
    firstName: 'Marley',
    fullName: 'Marley Dorsey',
    jerseyNumber: 14,
  },
  meera: {
    filename: '15_meera_headshot.jpg',
    url: 'https://i.imgur.com/sRCBiQo.jpeg',
    firstName: 'Meera',
    fullName: 'Meera Ramasubramanian',
    jerseyNumber: 15,
  },
  ella: {
    filename: '18_ella_headshot.jpg',
    url: 'https://i.imgur.com/1NYOhYH.jpeg',
    firstName: 'Ella',
    fullName: 'Ella Harris',
    jerseyNumber: 18,
  },
  sofia: {
    filename: '20_sofia_headshot.jpg',
    url: 'https://i.imgur.com/yFe7FeD.jpeg',
    firstName: 'Sofia',
    fullName: 'Sofia Marini',
    jerseyNumber: 20,
  },
  mia: {
    filename: '22_mia_headshot.jpg',
    url: 'https://i.imgur.com/byjHVgw.jpeg',
    firstName: 'Mia',
    fullName: 'Mia Tally',
    jerseyNumber: 22,
  },
  camille: {
    filename: '24_camille_headshot.jpg',
    url: 'https://i.imgur.com/cAInQxB.jpeg',
    firstName: 'Camille',
    fullName: 'Camille Chamberlain',
    jerseyNumber: 24,
  },
  mack: {
    filename: '24_camille_headshot.jpg',
    url: 'https://i.imgur.com/cAInQxB.jpeg',
    firstName: 'Mack (Camille)',
    fullName: 'Camille Chamberlain',
    jerseyNumber: 24,
  },
  emma: {
    filename: '25_emma_headshot.jpg',
    url: 'https://i.imgur.com/oQmrQ8c.jpeg',
    firstName: 'Emma',
    fullName: 'Emma Holtz',
    jerseyNumber: 25,
  },
  sakura: {
    filename: '26_sakura_headshot.jpg',
    url: 'https://i.imgur.com/Y0FJvHk.jpeg',
    firstName: 'Sakura',
    fullName: 'Sakura Kapla',
    jerseyNumber: 26,
  },
  jessica: {
    filename: '28_jessica_headshot.jpg',
    url: 'https://i.imgur.com/5MKv5Bg.jpeg',
    firstName: 'Jessica',
    fullName: 'Jessica Teixeira',
    jerseyNumber: 28,
  },
  amaya: {
    filename: '30_amaya_headshot.jpg',
    url: 'https://i.imgur.com/sOkeWd2.jpeg',
    firstName: 'Amaya',
    fullName: 'Amaya Espinoza',
    jerseyNumber: 30,
  },
  kayla: {
    filename: '32_kayla_headshot.jpg',
    url: 'https://i.imgur.com/MqdRdQg.jpeg',
    firstName: 'Kayla',
    fullName: 'Kayla Halada',
    jerseyNumber: 32,
  },
  avery: {
    filename: '37_avery_headshot.jpg',
    url: 'https://i.imgur.com/bhrA34h.jpeg',
    firstName: 'Avery',
    fullName: 'Avery Richter',
    jerseyNumber: 37,
  },
  isabella_gagni: {
    filename: '47_isabella_gagni_headshot.jpg',
    url: 'https://i.imgur.com/nfyofPG.jpeg',
    firstName: 'Isabella (#46)',
    fullName: 'Isabella Gagni',
    jerseyNumber: 46,
  },
  isabella: {
    filename: '47_isabella_gagni_headshot.jpg',
    url: 'https://i.imgur.com/nfyofPG.jpeg',
    firstName: 'Isabella',
    fullName: 'Isabella Gagni',
    jerseyNumber: 46,
  },
  sadie: {
    filename: '49_sadie_headshot.jpg',
    url: 'https://i.imgur.com/njCAIUP.jpeg',
    firstName: 'Sadie',
    fullName: 'Sadie Goldberg',
    jerseyNumber: 49,
  },
};

/**
 * Previous Imgur album URLs and default crest placeholders that should be upgraded
 * to the new Imgur album (https://imgur.com/a/Gc4jn5p).
 */
export const LEGACY_HEADSHOT_URLS = new Set<string>([
  'https://i.imgur.com/9bM3Tr1.jpeg',
  'https://i.imgur.com/CBROqa4.jpeg',
  'https://i.imgur.com/BgA9tkV.jpeg',
  'https://i.imgur.com/FAqbkxw.jpeg',
  'https://i.imgur.com/F9OMlVL.jpeg',
  'https://i.imgur.com/2leh7W5.jpeg',
  'https://i.imgur.com/mDWC2cz.jpeg',
  'https://i.imgur.com/z82Kr8e.jpeg',
  'https://i.imgur.com/FCXUDDf.jpeg',
  'https://i.imgur.com/mEo0r5F.jpeg',
  'https://i.imgur.com/OWHGLWq.jpeg',
  'https://i.imgur.com/AqxihGX.jpeg',
  'https://i.imgur.com/fxGV8qB.jpeg',
  'https://i.imgur.com/IbQY6g6.jpeg',
  'https://i.imgur.com/aTnMjDm.jpeg',
  'https://i.imgur.com/nu130xn.jpeg',
  'https://i.imgur.com/bNtd5dL.jpeg',
  'https://i.imgur.com/c0qeiY4.png',
  '/assets/daf-crest.png',
  '/logo.png',
]);

export function isLegacyOrPlaceholderHeadshot(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  if (LEGACY_HEADSHOT_URLS.has(trimmed)) return true;
  if (trimmed.includes('images.unsplash.com') || trimmed.includes('c0qeiY4') || trimmed.includes('daf-crest')) {
    return true;
  }
  return false;
}

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
 * Finds the official headshot URL from the updated Imgur album (https://imgur.com/a/Gc4jn5p)
 * matching by full name, jersey number, or first name.
 */
export function getOfficialImgurHeadshotForPlayer(playerName?: string, jerseyNumber?: number): string | null {
  const normName = (playerName || '').trim().toLowerCase();
  if (normName) {
    if (normName.includes('guillebeaux')) return IMGUR_HEADSHOTS.isabella_guillebeaux.url;
    if (normName.includes('gagni')) return IMGUR_HEADSHOTS.isabella_gagni.url;

    for (const item of Object.values(IMGUR_HEADSHOTS)) {
      if (item.fullName && item.fullName.toLowerCase() === normName) {
        return item.url;
      }
    }
  }

  if (jerseyNumber === 4 && normName.startsWith('isabella')) {
    return IMGUR_HEADSHOTS.isabella_guillebeaux.url;
  }
  if ((jerseyNumber === 46 || jerseyNumber === 47) && normName.startsWith('isabella')) {
    return IMGUR_HEADSHOTS.isabella_gagni.url;
  }

  const firstName = extractFirstName(playerName || '');
  if (firstName && IMGUR_HEADSHOTS[firstName]) {
    return IMGUR_HEADSHOTS[firstName].url;
  }

  return null;
}

/**
 * Resolves player headshot:
 * Checks if a player has a matching headshot in the Imgur album (https://imgur.com/a/Gc4jn5p).
 * If no match, or if the photo is missing or an old placeholder, returns the Club Logo (DEFAULT_PLAYER_PHOTO).
 */
export function getPlayerHeadshot(playerName: string, customPhotoUrl?: string, jerseyNumber?: number): string {
  // If a non-legacy custom photo is explicitly provided by user
  if (customPhotoUrl && customPhotoUrl.trim() !== '' && !isLegacyOrPlaceholderHeadshot(customPhotoUrl)) {
    return transformImageUrl(customPhotoUrl.trim());
  }

  const official = getOfficialImgurHeadshotForPlayer(playerName, jerseyNumber);
  if (official) {
    return official;
  }

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




/**
 * Produces crisp, high-resolution 1-2MB JPEGs (up to 2560px, 0.92 quality)
 * preserving all fine details, jersey text, and sharp focus.
 */
export async function compressHeadshot(file: File, maxDim = 2560, quality = 0.92): Promise<string> {
  return compressImage(file, maxDim, quality);
}

export async function compressImage(file: File, maxWidth = 2560, quality = 0.92): Promise<string> {
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
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.readAsDataURL(file);
        return;
      }

      let width = img.width;
      let height = img.height;

      // Only scale down if image exceeds max dimensions (e.g. 2560px)
      if (width > maxWidth || height > maxWidth) {
        if (width >= height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      // High-quality image downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Fallback FileReader failed"));
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.onerror = () => reject(new Error("Fallback FileReader failed"));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
