import { Listing } from '@/types';

export interface ListingRegion {
  slug: string;
  name: string;
  keywords: string[];
}

export const czechRegions: ListingRegion[] = [
  { slug: 'praha', name: 'Praha', keywords: ['praha'] },
  { slug: 'jihomoravsky-kraj', name: 'Jihomoravský kraj', keywords: ['brno', 'blansko', 'břeclav', 'hodonín', 'vyškov', 'znojmo'] },
  { slug: 'stredocesky-kraj', name: 'Středočeský kraj', keywords: ['kladno', 'mladá boleslav', 'kolín', 'benešov', 'beroun', 'příbram'] },
  { slug: 'jihocesky-kraj', name: 'Jihočeský kraj', keywords: ['české budějovice', 'tábor', 'písek', 'jindřichův hradec'] },
  { slug: 'plzensky-kraj', name: 'Plzeňský kraj', keywords: ['plzeň', 'domažlice', 'tachov', 'rokycany'] },
  { slug: 'ustecky-kraj', name: 'Ústecký kraj', keywords: ['ústí nad labem', 'teplice', 'most', 'děčín', 'chomutov'] },
  { slug: 'liberecky-kraj', name: 'Liberecký kraj', keywords: ['liberec', 'jablonec', 'česká lípa', 'semily'] },
  { slug: 'kralovehradecky-kraj', name: 'Královéhradecký kraj', keywords: ['hradec králové', 'náchod', 'trutnov', 'jičín'] },
  { slug: 'pardubicky-kraj', name: 'Pardubický kraj', keywords: ['pardubice', 'chrudim', 'svitavy', 'ústí nad orlicí'] },
  { slug: 'kraj-vysocina', name: 'Kraj Vysočina', keywords: ['jihlava', 'třebíč', 'pelhřimov', 'havlíčkův brod'] },
  { slug: 'olomoucky-kraj', name: 'Olomoucký kraj', keywords: ['olomouc', 'prostějov', 'přerov', 'šumperk'] },
  { slug: 'moravskoslezsky-kraj', name: 'Moravskoslezský kraj', keywords: ['ostrava', 'karviná', 'frýdek-místek', 'opava', 'nový jičín'] },
  { slug: 'zlinsky-kraj', name: 'Zlínský kraj', keywords: ['zlín', 'kroměříž', 'uherské hradiště', 'vsetín'] },
  { slug: 'karlovarsky-kraj', name: 'Karlovarský kraj', keywords: ['karlovy vary', 'cheb', 'sokolov'] },
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function slugifyTaxonomyLabel(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getRegionForListing(listing: Listing) {
  const haystack = normalize(`${listing.location} ${listing.street_address || ''}`);
  return czechRegions.find((region) => region.keywords.some((keyword) => haystack.includes(normalize(keyword)))) || null;
}

export function getPropertyTypeSlug(propertyType: string) {
  return slugifyTaxonomyLabel(propertyType);
}

export function getPropertyTypeLabelFromSlug(slug: string, listings: Listing[]) {
  const match = listings.find((listing) => getPropertyTypeSlug(listing.property_type) === slug);
  return match?.property_type || null;
}
