import { Listing } from '@/types';
import { parseListing } from '@/lib/listingMetadata';

export function getListingQualityChecklist(listing: Listing) {
  const parsed = parseListing(listing);
  const checks = [
    {
      label: 'Alespoň 4 kvalitní fotografie',
      done: (listing.images || []).length >= 4,
    },
    {
      label: 'Doplněná cena celé nemovitosti',
      done: Boolean(listing.full_property_value),
    },
    {
      label: 'Vyplněný důvod prodeje',
      done: Boolean(parsed.details.saleReason),
    },
    {
      label: 'Vyplněný investiční potenciál nebo benefity',
      done: Boolean(parsed.details.investmentPotential || parsed.details.benefits),
    },
    {
      label: 'Telefon pro rychlý kontakt',
      done: Boolean(listing.contact_phone),
    },
    {
      label: 'Přesnější popis lokality',
      done: Boolean(parsed.details.locationDetail),
    },
  ];

  const completed = checks.filter((item) => item.done).length;
  const score = Math.round((completed / checks.length) * 100);

  return {
    checks,
    score,
    missing: checks.filter((item) => !item.done),
  };
}
