import type { Player } from '../types';

/**
 * Validates whether a profile document/PDF string is an actual navigable URL or data URI,
 * rather than a descriptive text label (e.g., "Eliot Kline Player Profile" or "Elise Laxague (1).pdf").
 */
export function isValidDocumentUrl(url?: string): boolean {
  return Boolean(normalizeDocumentUrl(url));
}

export function normalizeDocumentUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (
    lower === 'na' ||
    lower === 'n/a' ||
    lower === 'none' ||
    lower === 'tbd' ||
    lower === '#' ||
    lower.includes('instagram.com') ||
    lower.includes('youtube.com') ||
    lower.includes('youtu.be')
  ) {
    return undefined;
  }
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:application/pdf') ||
    lower.startsWith('/assets/') ||
    lower.startsWith('/profiles/')
  ) {
    return trimmed;
  }
  // Support bare domain links from spreadsheets (e.g., drive.google.com/..., docs.google.com/..., canva.com/..., canva.link/...)
  if (
    !/\s/.test(trimmed) &&
    (lower.startsWith('drive.google.com/') ||
      lower.startsWith('docs.google.com/') ||
      lower.startsWith('www.canva.com/') ||
      lower.startsWith('canva.com/') ||
      lower.startsWith('canva.link/') ||
      lower.startsWith('www.dropbox.com/') ||
      lower.startsWith('dropbox.com/'))
  ) {
    return `https://${trimmed}`;
  }
  return undefined;
}

/**
 * Returns the first valid downloadable/viewable document URL for a player, or undefined if none exists.
 */
export function getValidDocumentUrl(player: Pick<Player, 'profilePdfUrl' | 'profileDocUrl'>): string | undefined {
  return normalizeDocumentUrl(player.profilePdfUrl) || normalizeDocumentUrl(player.profileDocUrl);
}

/**
 * Validates and normalizes a highlight video URL (returns undefined for plain text labels like "Jessica Teixeira Highlights"
 * or bare homepage placeholders like "https://www.youtube.com").
 */
export function getValidVideoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed || /\s/.test(trimmed)) return undefined;
  const lower = trimmed.toLowerCase().replace(/\/+$/, '');
  if (
    lower === 'na' ||
    lower === 'n/a' ||
    lower === 'none' ||
    lower === 'tbd' ||
    lower.includes('instagram.com') ||
    lower === 'https://www.youtube.com' ||
    lower === 'http://www.youtube.com' ||
    lower === 'https://youtube.com' ||
    lower === 'http://youtube.com' ||
    lower === 'www.youtube.com' ||
    lower === 'youtube.com'
  ) {
    return undefined;
  }
  if (lower.startsWith('http://')) {
    return `https://${trimmed.slice(7)}`;
  }
  if (lower.startsWith('https://')) {
    return trimmed;
  }
  if (
    lower.startsWith('www.youtube.com/') ||
    lower.startsWith('youtube.com/') ||
    lower.startsWith('youtu.be/') ||
    lower.startsWith('drive.google.com/') ||
    lower.startsWith('my.sportsrecruits.com/') ||
    lower.startsWith('hudl.com/') ||
    lower.startsWith('app.veo.co/')
  ) {
    return `https://${trimmed}`;
  }
  return undefined;
}

/**
 * Validates and normalizes an Instagram URL or @handle (returns undefined for plain text labels like "Eliot Kline Instagram").
 */
export function getValidInstagramUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed || /\s/.test(trimmed)) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower === 'na' || lower === 'n/a' || lower === 'none' || lower === 'tbd') return undefined;
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }
  if (lower.startsWith('instagram.com/') || lower.startsWith('www.instagram.com/')) {
    return `https://${trimmed}`;
  }
  if (trimmed.startsWith('@') && trimmed.length > 1) {
    return `https://www.instagram.com/${trimmed.slice(1)}`;
  }
  return undefined;
}
