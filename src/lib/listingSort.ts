import { Listing } from '@/types';

export function sortListings(listings: Listing[]) {
  return [...listings].sort((a, b) => {
    if (a.is_top !== b.is_top) {
      return Number(b.is_top) - Number(a.is_top);
    }

    if (a.is_highlighted !== b.is_highlighted) {
      return Number(b.is_highlighted) - Number(a.is_highlighted);
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
