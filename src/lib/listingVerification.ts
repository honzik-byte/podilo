import { Listing } from '@/types';
import { parseListing, serializeListingDescription } from '@/lib/listingMetadata';

export type VerificationMethod = 'telefon' | 'identita' | 'nic';

export function getVerificationDetails(listing: Listing) {
  const parsed = parseListing(listing);
  const verified = parsed.details.legalNote?.includes('[PODILO_VERIFIED]') || false;
  const methodMatch = parsed.details.legalNote?.match(/\[PODILO_METHOD:([a-z]+)\]/);
  const method = (methodMatch?.[1] as VerificationMethod | undefined) || 'nic';

  return {
    verified,
    method,
  };
}

export function applyVerificationToDescription(listing: Listing, verified: boolean, method: VerificationMethod) {
  const parsed = parseListing(listing);
  const cleanLegalNote = (parsed.details.legalNote || '')
    .replace(/\[PODILO_VERIFIED\]/g, '')
    .replace(/\[PODILO_METHOD:[a-z]+\]/g, '')
    .trim();

  const prefix = verified ? `[PODILO_VERIFIED] [PODILO_METHOD:${method}]` : '';
  const legalNote = [prefix, cleanLegalNote].filter(Boolean).join(' ').trim();

  return serializeListingDescription(parsed.description, {
    ...parsed.details,
    legalNote: legalNote || undefined,
  });
}
