import type { Player } from '../types';

/**
 * Validates whether a profile document/PDF string is an actual navigable URL or data URI,
 * rather than a descriptive text label (e.g., "Eliot Kline Player Profile" or "Elise Laxague (1).pdf").
 */
export function isValidDocumentUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower === 'na' || lower === 'n/a' || lower === 'none' || lower === 'tbd') {
    return false;
  }
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:application/pdf') ||
    lower.startsWith('/assets/') ||
    lower.startsWith('/profiles/')
  );
}

/**
 * Returns the first valid downloadable/viewable document URL for a player, or undefined if none exists.
 */
export function getValidDocumentUrl(player: Pick<Player, 'profilePdfUrl' | 'profileDocUrl'>): string | undefined {
  if (isValidDocumentUrl(player.profilePdfUrl)) {
    return player.profilePdfUrl!.trim();
  }
  if (isValidDocumentUrl(player.profileDocUrl)) {
    return player.profileDocUrl!.trim();
  }
  return undefined;
}

/**
 * Validates and normalizes a highlight video URL (returns undefined for plain text labels like "Jessica Teixeira Highlights").
 */
export function getValidVideoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed || /\s/.test(trimmed)) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower === 'na' || lower === 'n/a' || lower === 'none' || lower === 'tbd') return undefined;
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }
  if (
    lower.startsWith('www.youtube.com') ||
    lower.startsWith('youtube.com') ||
    lower.startsWith('youtu.be/') ||
    lower.startsWith('drive.google.com') ||
    lower.startsWith('hudl.com') ||
    lower.startsWith('app.veo.co')
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
