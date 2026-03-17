export const FAVORITES_STORAGE_KEY = 'podilo-favorites';
export const FAVORITES_VISITOR_KEY = 'podilo-favorites-visitor';

export function readFavorites() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent('podilo-favorites-updated', { detail: ids }));
}

export function getOrCreateFavoritesVisitorId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = window.localStorage.getItem(FAVORITES_VISITOR_KEY);
  if (existing) {
    return existing;
  }

  const nextId = `visitor-${crypto.randomUUID()}`;
  window.localStorage.setItem(FAVORITES_VISITOR_KEY, nextId);
  return nextId;
}

export function toggleFavorite(listingId: string) {
  const favorites = readFavorites();
  const nextFavorites = favorites.includes(listingId)
    ? favorites.filter((id) => id !== listingId)
    : [...favorites, listingId];

  writeFavorites(nextFavorites);
  return nextFavorites;
}
