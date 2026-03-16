'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import Button from '@/components/Button';
import ClientImage from '@/components/ClientImage';
import FavoriteButton from '@/components/FavoriteButton';
import WhyRegisterCard from '@/components/WhyRegisterCard';
import {
  formatPrice,
  getDiscountLabel,
  getShareValueEstimate,
  parseListing,
} from '@/lib/listingMetadata';
import styles from './page.module.css';

const SingleMapDynamic = dynamic(() => import('@/components/SingleListingMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoadingSkeleton}>Načítání polohy na mapě...</div>,
});

const detailRows = (listing: Listing, details: ReturnType<typeof parseListing>['details']) => [
  ['Typ nemovitosti', listing.property_type],
  ['Podíl', listing.share_size],
  ['Obsazenost', listing.occupancy || details.currentUse || 'Neuvedeno'],
  ['Dispozice', details.disposition || 'Neuvedeno'],
  ['Užitná plocha', details.usableArea || 'Neuvedeno'],
  ['Počet místností', details.roomCount || 'Neuvedeno'],
  ['Stav nemovitosti', details.propertyCondition || 'Neuvedeno'],
  ['Patro', details.floor || 'Neuvedeno'],
  ['Výtah', details.elevator || 'Neuvedeno'],
  ['Počet spoluvlastníků', details.coOwnerCount || 'Neuvedeno'],
  ['Typ příležitosti', details.opportunityType || 'Neuvedeno'],
  ['Stav nabídky', details.listingStatus || 'Aktivní'],
];

const featureRows = (details: ReturnType<typeof parseListing>['details']) => [
  details.balcony ? 'Balkon' : '',
  details.terrace ? 'Terasa' : '',
  details.cellar ? 'Sklep' : '',
  details.parking ? 'Parkování' : '',
].filter(Boolean);

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeImage, setActiveImage] = useState<string>('/placeholder.jpg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const { id } = resolvedParams;

      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        const localResponse = await fetch(`/api/local-listings/${id}`);
        if (!localResponse.ok) {
          notFound();
          return;
        }

        const localListing = (await localResponse.json()) as Listing;
        setListing(localListing);
        if (localListing.images && localListing.images.length > 0) {
          setActiveImage(localListing.images[0]);
        }
        setLoading(false);
        return;
      }

      setListing(data as Listing);
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0]);
      }
      setLoading(false);
    }

    loadData();
  }, [params]);

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Načítám inzerát...</div>;
  }

  if (!listing) {
    return null;
  }

  const parsed = parseListing(listing);
  const shareEstimate = getShareValueEstimate(listing);
  const discountLabel = getDiscountLabel(listing);
  const details = detailRows(listing, parsed.details);
  const features = featureRows(parsed.details);

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
                  <a href={`tel:${listing.contact_phone}`} className={styles.phoneNumber}>
                    {listing.contact_phone}
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

            <a href={`mailto:${listing.contact_email}?subject=Zájem o nabídku z Podilo: ${listing.title}`}>
              <Button fullWidth>Napsat e-mail prodejci</Button>
            </a>
          </div>

          {!session && <WhyRegisterCard compact title="Účet se vyplatí hlavně aktivním kupujícím" />}
        </aside>
      </div>
    </div>
  );
}
