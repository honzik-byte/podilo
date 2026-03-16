import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import { Listing } from '@/types';
import { ListingDetails, serializeListingDescription } from '@/lib/listingMetadata';

export interface LocalListingRecord extends Omit<Listing, 'description'> {
  descriptionText: string;
  details: ListingDetails;
}

const localListingsPath = path.join(process.cwd(), 'src/data/localListings.json');

async function readLocalListingRecords() {
  const content = await fs.readFile(localListingsPath, 'utf8');
  return JSON.parse(content) as LocalListingRecord[];
}

export async function writeLocalListingRecords(records: LocalListingRecord[]) {
  await fs.writeFile(localListingsPath, JSON.stringify(records, null, 2), 'utf8');
}

export function toListing(record: LocalListingRecord): Listing {
  return {
    ...record,
    description: serializeListingDescription(record.descriptionText || '', record.details || {}),
  };
}

export async function getLocalListings() {
  const records = await readLocalListingRecords();
  return records.map(toListing);
}

export async function getLocalListingById(id: string) {
  const records = await readLocalListingRecords();
  const record = records.find((item) => item.id === id);
  return record ? toListing(record) : null;
}

export async function getLocalListingRecordById(id: string) {
  const records = await readLocalListingRecords();
  return records.find((item) => item.id === id) || null;
}

export async function upsertLocalListing(record: LocalListingRecord) {
  const records = await readLocalListingRecords();
  const index = records.findIndex((item) => item.id === record.id);

  if (index === -1) {
    records.push(record);
  } else {
    records[index] = record;
  }

  await writeLocalListingRecords(records);
}

export async function deleteLocalListing(id: string) {
  const records = await readLocalListingRecords();
  const nextRecords = records.filter((item) => item.id !== id);
  await writeLocalListingRecords(nextRecords);
}

export async function mergeWithLocalListings(listings: Listing[] = [], minCount = 10) {
  const localListings = await getLocalListings();
  const existingIds = new Set(listings.map((listing) => listing.id));
  const merged = [...listings, ...localListings.filter((listing) => !existingIds.has(listing.id))];

  if (merged.length >= minCount) {
    return merged;
  }

  return merged;
}
