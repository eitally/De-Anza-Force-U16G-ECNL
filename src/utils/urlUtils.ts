import type { Player } from '../types';

/**
 * Validates whether a profile document/PDF string is an actual navigable URL or data URI,
 * rather than a descriptive text label (e.g., "Eliot Kline Player Profile" or "NA").
 */
export function isValidDocumentUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (lower === 'na' || lower === 'n/a' || lower === 'none' || lower === 'pending' || lower === '#') {
    return false;
  }

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:application/pdf') ||
    lower.startsWith('blob:') ||
    lower.startsWith('/')
  ) {
    return true;
  }

  return false;
}

/**
 * Returns the first valid navigable PDF/document URL for a player, or undefined if none exists.
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
