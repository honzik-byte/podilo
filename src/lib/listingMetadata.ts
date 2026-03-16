import { Listing } from '@/types';

const DETAILS_MARKER = '\n\n<!-- PODILO_METADATA ';
const DETAILS_MARKER_END = ' -->';

export interface ListingDetails {
  disposition?: string;
  usableArea?: string;
  roomCount?: string;
  propertyCondition?: string;
  floor?: string;
  elevator?: string;
  balcony?: boolean;
  terrace?: boolean;
  cellar?: boolean;
  parking?: boolean;
  currentUse?: string;
  tenancy?: string;
  coOwnerCount?: string;
  saleReason?: string;
  legalNote?: string;
  investmentPotential?: string;
  locationDetail?: string;
  benefits?: string;
  financingOptions?: string;
  opportunityType?: string;
  listingStatus?: string;
}

export interface ParsedListing {
  listing: Listing;
  description: string;
  details: ListingDetails;
}

export function serializeListingDescription(description: string, details: ListingDetails) {
  const cleanDescription = description.trim();
  const hasDetails = Object.values(details).some((value) => {
    if (typeof value === 'boolean') {
      return value;
    }

    return Boolean(value && String(value).trim());
  });

  if (!hasDetails) {
    return cleanDescription;
  }

  return `${cleanDescription}${DETAILS_MARKER}${JSON.stringify(details)}${DETAILS_MARKER_END}`.trim();
}

export function parseListing(listing: Listing): ParsedListing {
  const description = listing.description || '';
  const markerIndex = description.indexOf(DETAILS_MARKER);

  if (markerIndex === -1) {
    return {
      listing,
      description: description.trim(),
      details: {},
    };
  }

  const content = description.slice(0, markerIndex).trim();
  const rawMetadata = description
    .slice(markerIndex + DETAILS_MARKER.length)
    .split(DETAILS_MARKER_END)[0];

  try {
    return {
      listing,
      description: content,
      details: JSON.parse(rawMetadata) as ListingDetails,
    };
  } catch {
    return {
      listing,
      description: description.trim(),
      details: {},
    };
  }
}

export function formatPrice(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'Neuvedeno';
  }

  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function getShareValueEstimate(listing: Listing) {
  if (!listing.full_property_value || !listing.share_size.includes('/')) {
    return null;
  }

  const [numeratorText, denominatorText] = listing.share_size.split('/');
  const numerator = Number(numeratorText);
  const denominator = Number(denominatorText);

  if (!numerator || !denominator) {
    return null;
  }

  return (listing.full_property_value * numerator) / denominator;
}

export function getDiscountLabel(listing: Listing) {
  const estimatedShareValue = getShareValueEstimate(listing);

  if (!estimatedShareValue || !listing.price) {
    return null;
  }

  const delta = estimatedShareValue - listing.price;
  const percentage = Math.round((delta / estimatedShareValue) * 100);

  if (Math.abs(percentage) < 3) {
    return 'Cena odpovídá odhadu hodnoty podílu';
  }

  if (percentage > 0) {
    return `Nabídková cena je přibližně o ${percentage} % pod odhadem hodnoty podílu`;
  }

  return `Nabídková cena je přibližně o ${Math.abs(percentage)} % nad odhadem hodnoty podílu`;
}

export function getListingStatus(listing: Listing, details: ListingDetails) {
  return details.listingStatus || 'Aktivní';
}

export function getOpportunityType(details: ListingDetails) {
  return details.opportunityType || '';
}

export function matchesText(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}
