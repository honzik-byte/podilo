import 'server-only';

import { Listing } from '@/types';
import { ListingDetails, serializeListingDescription } from '@/lib/listingMetadata';
import { sortListings } from '@/lib/listingSort';
import { createServerSupabaseAdmin } from '@/lib/serverSupabase';

export interface LocalListingRecord extends Omit<Listing, 'description'> {
  descriptionText: string;
  details: ListingDetails;
}

interface LocalListingRow {
  id: string;
  title: string;
  location: string;
  street_address: string | null;
  property_type: string;
  share_size: string;
  price: number;
  full_property_value: number | null;
  occupancy: string | null;
  description_text: string | null;
  details: ListingDetails | null;
  images: string[] | null;
  contact_email: string;
  contact_phone: string | null;
  lat: number | null;
  lng: number | null;
  is_top: boolean;
  is_highlighted: boolean;
  user_id: string | null;
  top_until: string | null;
  highlighted_until: string | null;
  created_at: string;
  updated_at: string | null;
}

function rowToRecord(row: LocalListingRow): LocalListingRecord {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    street_address: row.street_address || '',
    property_type: row.property_type,
    share_size: row.share_size,
    price: row.price,
    full_property_value: row.full_property_value,
    occupancy: row.occupancy,
    descriptionText: row.description_text || '',
    details: row.details || {},
    images: row.images || [],
    contact_email: row.contact_email,
    contact_phone: row.contact_phone,
    lat: row.lat,
    lng: row.lng,
    is_top: row.is_top,
    is_highlighted: row.is_highlighted,
    user_id: row.user_id,
    top_until: row.top_until,
    highlighted_until: row.highlighted_until,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function recordToRow(record: LocalListingRecord) {
  return {
    id: record.id,
    title: record.title,
    location: record.location,
    street_address: record.street_address || null,
    property_type: record.property_type,
    share_size: record.share_size,
    price: record.price,
    full_property_value: record.full_property_value ?? null,
    occupancy: record.occupancy ?? null,
    description_text: record.descriptionText || '',
    details: record.details || {},
    images: record.images || [],
    contact_email: record.contact_email,
    contact_phone: record.contact_phone ?? null,
    lat: record.lat ?? null,
    lng: record.lng ?? null,
    is_top: record.is_top,
    is_highlighted: record.is_highlighted,
    user_id: record.user_id ?? null,
    top_until: record.top_until ?? null,
    highlighted_until: record.highlighted_until ?? null,
  };
}

async function readLocalListingRecords() {
  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient.from('local_listings').select('*');

  if (error) {
    console.error('[LocalListings] Failed to load local listings', { error });
    return [];
  }

  return ((data as LocalListingRow[]) || []).map(rowToRecord);
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
  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient.from('local_listings').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    if (error) {
      console.error('[LocalListings] Failed to load local listing', { id, error });
    }
    return null;
  }

  return toListing(rowToRecord(data as LocalListingRow));
}

export async function getLocalListingRecordById(id: string) {
  const adminClient = createServerSupabaseAdmin();
  const { data, error } = await adminClient.from('local_listings').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    if (error) {
      console.error('[LocalListings] Failed to load local listing record', { id, error });
    }
    return null;
  }

  return rowToRecord(data as LocalListingRow);
}

export async function upsertLocalListing(record: LocalListingRecord) {
  const adminClient = createServerSupabaseAdmin();
  const nextRecord = {
    ...record,
    updated_at: new Date().toISOString(),
  };

  const { error } = await adminClient
    .from('local_listings')
    .upsert({ ...recordToRow(nextRecord), updated_at: nextRecord.updated_at }, { onConflict: 'id' });

  if (error) {
    console.error('[LocalListings] Failed to save local listing', { id: record.id, error });
    throw new Error(error.message);
  }
}

export async function deleteLocalListing(id: string) {
  const adminClient = createServerSupabaseAdmin();
  const { error } = await adminClient.from('local_listings').delete().eq('id', id);

  if (error) {
    console.error('[LocalListings] Failed to delete local listing', { id, error });
    throw new Error(error.message);
  }
}

export async function mergeWithLocalListings(listings: Listing[] = [], minCount = 10) {
  const localListings = await getLocalListings();
  const existingIds = new Set(listings.map((listing) => listing.id));
  const merged = sortListings([
    ...listings,
    ...localListings.filter((listing) => !existingIds.has(listing.id)),
  ]);

  if (merged.length >= minCount) {
    return merged;
  }

  return merged;
}
