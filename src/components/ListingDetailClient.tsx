'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Session } from '@supabase/supabase-js';
import { Listing } from '@/types';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import ClientImage from '@/components/ClientImage';
import FavoriteButton from '@/components/FavoriteButton';
import LeadContactForm from '@/components/LeadContactForm';
import ListingCard from '@/components/ListingCard';
import ShareListingActions from '@/components/ShareListingActions';
import WhyRegisterCard from '@/components/WhyRegisterCard';
import { getOrCreateFavoritesVisitorId } from '@/lib/favorites';
import { formatCzechPhone } from '@/lib/formatting';
import { getListingQualityChecklist } from '@/lib/listingQuality';
import { getVerificationDetails } from '@/lib/listingVerification';
import {
  formatPrice,
  getDiscountLabel,
  getEnergyClass,
  getPropertyFieldConfig,
  getShareValueEstimate,
  parseListing,
} from '@/lib/listingMetadata';
import styles from '@/app/listings/[id]/page.module.css';

const SingleMapDynamic = dynamic(() => import('@/components/SingleListingMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoadingSkeleton}>Načítání polohy na mapě...</div>,
});

const detailRows = (listing: Listing, details: ReturnType<typeof parseListing>['details']) => {
  const config = getPropertyFieldConfig(listing.property_type);

  return [
    ['Typ nemovitosti', listing.property_type],
    ['Podíl', listing.share_size],
    ['Obsazenost', listing.occupancy || details.currentUse || 'Neuvedeno'],
    config.showDisposition ? ['Dispozice', details.disposition || 'Neuvedeno'] : null,
    [config.areaLabel, details.usableArea || 'Neuvedeno'],
    config.showRoomCount ? ['Počet místností', details.roomCount || 'Neuvedeno'] : null,
    config.showPropertyCondition ? ['Stav nemovitosti', details.propertyCondition || 'Neuvedeno'] : null,
    config.showEnergyClass ? ['Energetická třída', getEnergyClass(listing, details)] : null,
    config.showFloor ? ['Patro', details.floor || 'Neuvedeno'] : null,
    config.showElevator ? ['Výtah', details.elevator || 'Neuvedeno'] : null,
    ['Počet spoluvlastníků', details.coOwnerCount || 'Neuvedeno'],
    ['Typ příležitosti', details.opportunityType || 'Neuvedeno'],
    ['Stav nabídky', details.listingStatus || 'Aktivní'],
  ].filter(Boolean) as Array<[string, string]>;
};

const featureRows = (listing: Listing, details: ReturnType<typeof parseListing>['details']) => {
  const config = getPropertyFieldConfig(listing.property_type);

  if (!config.showFeatureTags) {
    return [];
  }

  return [
    details.balcony ? 'Balkon' : '',
    details.terrace ? 'Terasa' : '',
    details.cellar ? 'Sklep' : '',
    details.parking ? 'Parkování' : '',
  ].filter(Boolean);
};

interface ListingDetailClientProps {
  listing: Listing;
  relatedListings: Listing[];
}

export default function ListingDetailClient({ listing, relatedListings }: ListingDetailClientProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [activeImage, setActiveImage] = useState<string>(listing.images?.[0] || '/placeholder.jpg');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: sessionData }) => {
      setSession(sessionData.session);
    });
  }, []);

  const parsed = parseListing(listing);
  const shareEstimate = getShareValueEstimate(listing);
  const discountLabel = getDiscountLabel(listing);
  const details = detailRows(listing, parsed.details);
  const features = featureRows(listing, parsed.details);
  const supportEmail = 'podpora@podilo.cz';
  const quality = getListingQualityChecklist(listing);
  const verification = getVerificationDetails(listing);
  const isOwner = Boolean(session?.user?.id && listing.user_id && session.user.id === listing.user_id);
  const formatDate = (value?: string | null) =>
    value
      ? new Intl.DateTimeFormat('cs-CZ', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(value))
      : 'Neuvedeno';

  useEffect(() => {
    const visitorId = getOrCreateFavoritesVisitorId();
    void fetch(`/api/listing-analytics/${listing.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'detail_view',
        visitorId,
      }),
    });
  }, [listing.id]);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.breadcrumb}>
        <Link href="/listings" className={styles.backLink}>
          ← Zpět na nabídky
        </Link>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.heroCard}>
            <div className={styles.heroHeader}>
              <div>
                <p className={styles.location}>
                  {listing.street_address ? `${listing.street_address}, ${listing.location}` : listing.location}
                </p>
                <h1 className={styles.title}>{listing.title}</h1>
                <div className={styles.heroTags}>
                  <span className={styles.heroTag}>Podíl {listing.share_size}</span>
                  <span className={styles.heroTag}>{listing.property_type}</span>
                  <span className={styles.heroTag}>{parsed.details.opportunityType || 'Standardní nabídka'}</span>
                  {verification.verified && (
                    <span className={styles.heroTag}>
                      {verification.method === 'identita' ? 'Ověřený inzerent identitou' : 'Ověřený inzerent telefonem'}
                    </span>
                  )}
                </div>
              </div>

              <FavoriteButton listingId={listing.id} variant="inline" />
            </div>

            <div className={styles.gallery}>
              <div className={styles.mainImageWrapper}>
                <ClientImage
                  src={activeImage}
                  alt={listing.title}
                  className={styles.image}
                  fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23ececf1%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22300%22%20fill%3D%22%23999999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%3ENen%C3%AD%20fotografie%3C%2Ftext%3E%3C%2Fsvg%3E"
                />
              </div>

              {listing.images && listing.images.length > 1 && (
                <div className={styles.thumbnailGrid}>
                  {listing.images.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      className={styles.thumbnailWrapper}
                      data-active={activeImage === image}
                      onClick={() => setActiveImage(image)}
                    >
                      <ClientImage
                        src={image}
                        alt={`${listing.title} - foto ${index + 1}`}
                        className={styles.thumbnailImage}
                        fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23ececf1%22%2F%3E%3C%2Fsvg%3E"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2 className={styles.sectionTitle}>Shrnutí nabídky</h2>
              <p className={styles.sectionSubtitle}>
                Klíčové parametry pro rychlé vyhodnocení nabídky a srovnání s dalšími podíly.
              </p>
            </div>

            <div className={styles.infoGrid}>
              {details.map(([label, value]) => (
                <div key={label} className={styles.infoItem}>
                  <span className={styles.label}>{label}</span>
                  <span className={styles.value}>{value}</span>
                </div>
              ))}
            </div>

            {features.length > 0 && (
              <div className={styles.featureList}>
                {features.map((feature) => (
                  <span key={feature} className={styles.featureTag}>
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2 className={styles.sectionTitle}>Popis podílu</h2>
              <p className={styles.sectionSubtitle}>
                Kontext nabídky, stav nemovitosti a investor informace od prodávajícího.
              </p>
            </div>

            <div className={styles.description}>
              {parsed.description ? (
                parsed.description.split('\n').map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{paragraph}</p>
                ))
              ) : (
                <p className={styles.mutedText}>Prodávající zatím nepřidal podrobnější popis nabídky.</p>
              )}
            </div>

            {(parsed.details.saleReason || parsed.details.investmentPotential || parsed.details.legalNote) && (
              <div className={styles.notesGrid}>
                {parsed.details.saleReason && (
                  <div className={styles.noteCard}>
                    <span className={styles.noteLabel}>Důvod prodeje</span>
                    <p>{parsed.details.saleReason}</p>
                  </div>
                )}
                {parsed.details.investmentPotential && (
                  <div className={styles.noteCard}>
                    <span className={styles.noteLabel}>Investiční potenciál</span>
                    <p>{parsed.details.investmentPotential}</p>
                  </div>
                )}
                {parsed.details.legalNote && (
                  <div className={styles.noteCard}>
                    <span className={styles.noteLabel}>Právní poznámka</span>
                    <p>{parsed.details.legalNote}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {(parsed.details.locationDetail || parsed.details.benefits || parsed.details.financingOptions) && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 className={styles.sectionTitle}>Lokalita a další informace</h2>
              </div>

              <div className={styles.notesGrid}>
                {parsed.details.locationDetail && (
                  <div className={styles.noteCard}>
                    <span className={styles.noteLabel}>Přesnější popis lokality</span>
                    <p>{parsed.details.locationDetail}</p>
                  </div>
                )}
                {parsed.details.benefits && (
                  <div className={styles.noteCard}>
                    <span className={styles.noteLabel}>Benefity nemovitosti</span>
                    <p>{parsed.details.benefits}</p>
                  </div>
                )}
                {parsed.details.financingOptions && (
                  <div className={styles.noteCard}>
                    <span className={styles.noteLabel}>Možnost financování / dohody</span>
                    <p>{parsed.details.financingOptions}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {listing.lat && listing.lng && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 className={styles.sectionTitle}>Lokalita na mapě</h2>
                <p className={styles.sectionSubtitle}>
                  Přesnější poloha pomáhá odhadnout investiční atraktivitu a dostupnost lokality.
                </p>
              </div>
              <SingleMapDynamic listing={listing} />
            </section>
          )}

          {relatedListings.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h2 className={styles.sectionTitle}>Podobné nabídky</h2>
                <p className={styles.sectionSubtitle}>
                  Další příležitosti, které mají podobný profil nebo se nachází v podobném kontextu.
                </p>
              </div>
              <div className={styles.relatedGrid}>
                {relatedListings.map((related) => (
                  <ListingCard key={related.id} listing={related} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.priceCard}>
            <span className={styles.priceCardLabel}>Cena za nabízený podíl</span>
            <strong className={styles.price}>{formatPrice(listing.price)}</strong>

            <div className={styles.priceSummaryList}>
              <div>
                <span>Podíl</span>
                <strong>{listing.share_size}</strong>
              </div>
              <div>
                <span>Odhad ceny celé nemovitosti</span>
                <strong>{formatPrice(listing.full_property_value)}</strong>
              </div>
              <div>
                <span>Odhad hodnoty podílu</span>
                <strong>{formatPrice(shareEstimate)}</strong>
              </div>
            </div>

            {discountLabel && <p className={styles.priceInsight}>{discountLabel}</p>}
          </div>

          <div className={styles.contactCard}>
            <h3 className={styles.contactTitle}>Kontakt na prodávajícího</h3>
            <p className={styles.contactSubtitle}>
              Podilo pouze propojuje zájemce a prodávající. Další kroky už řešíte napřímo mezi sebou.
            </p>

            {listing.contact_phone && (
              <div className={styles.phoneBox}>
                <span className={styles.phoneLabel}>Telefon pro rychlý kontakt</span>
                {session ? (
                  <a
                    href={`tel:${listing.contact_phone}`}
                    className={styles.phoneNumber}
                    onClick={() => {
                      void fetch(`/api/listing-analytics/${listing.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          event: 'phone_click',
                        }),
                      });
                    }}
                    >
                    {formatCzechPhone(listing.contact_phone)}
                  </a>
                ) : (
                  <div className={styles.phoneHiddenWrapper}>
                    <span className={styles.phoneHidden}>+420 123 456 789</span>
                    <p className={styles.phoneLoginPrompt}>
                      Telefon zobrazujeme registrovaným uživatelům. Přihlaste se nebo si vytvořte účet.
                    </p>
                  </div>
                )}
              </div>
            )}

            <a href={`mailto:${supportEmail}?subject=Zájem o nabídku z Podilo: ${listing.title}`}>
              <Button fullWidth>Napsat e-mail prodejci</Button>
            </a>

            <LeadContactForm listingId={listing.id} listingTitle={listing.title} />
          </div>

          <div className={styles.metaCard}>
            <h3 className={styles.contactTitle}>Důvěryhodnost nabídky</h3>
            <div className={styles.metaList}>
              <div>
                <span className={styles.priceCardLabel}>Vloženo</span>
                <strong>{formatDate(listing.created_at)}</strong>
              </div>
              <div>
                <span className={styles.priceCardLabel}>Poslední úprava</span>
                <strong>{formatDate(listing.updated_at || listing.created_at)}</strong>
              </div>
              <div>
                <span className={styles.priceCardLabel}>Kontakt</span>
                <strong>
                  {verification.verified
                    ? verification.method === 'identita'
                      ? 'Ověřený inzerent identitou'
                      : 'Ověřený inzerent telefonem'
                    : 'Kontakt vedený přes Podilo'}
                </strong>
              </div>
              {isOwner && (listing.top_until || listing.highlighted_until) && (
                <div>
                  <span className={styles.priceCardLabel}>Aktivní propagace do</span>
                  <strong>{formatDate(listing.top_until || listing.highlighted_until)}</strong>
                </div>
              )}
            </div>
            <ShareListingActions title={listing.title} listingId={listing.id} />
          </div>

          <div className={styles.metaCard}>
            <h3 className={styles.contactTitle}>Kvalita prezentace</h3>
            <div className={styles.qualityScore}>
              <strong>{quality.score} %</strong>
              <span>vyplněnosti nabídky</span>
            </div>
            <div className={styles.qualityList}>
              {quality.checks.map((item) => (
                <div key={item.label} className={styles.qualityItem}>
                  <span>{item.done ? '✓' : '•'}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {!session && <WhyRegisterCard compact title="Účet se vyplatí hlavně aktivním kupujícím" />}
        </aside>
      </div>
    </div>
  );
}
