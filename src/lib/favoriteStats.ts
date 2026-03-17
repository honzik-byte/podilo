import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';

const favoriteStatsPath = path.join(process.cwd(), 'src/data/favoriteStats.json');

type FavoriteStatsStore = Record<string, string[]>;

async function readStore() {
  const content = await fs.readFile(favoriteStatsPath, 'utf8');
  return JSON.parse(content) as FavoriteStatsStore;
}

async function writeStore(store: FavoriteStatsStore) {
  await fs.writeFile(favoriteStatsPath, JSON.stringify(store, null, 2), 'utf8');
}

export async function getFavoriteCount(listingId: string) {
  const store = await readStore();
  return store[listingId]?.length || 0;
}

export async function getFavoriteCounts(listingIds: string[]) {
  const store = await readStore();
  return Object.fromEntries(listingIds.map((id) => [id, store[id]?.length || 0]));
}

export async function toggleFavoriteStat(listingId: string, visitorId: string, action: 'save' | 'unsave') {
  const store = await readStore();
  const current = new Set(store[listingId] || []);

  if (action === 'save') {
    current.add(visitorId);
  } else {
    current.delete(visitorId);
  }

  store[listingId] = [...current];
  await writeStore(store);
  return store[listingId].length;
}
