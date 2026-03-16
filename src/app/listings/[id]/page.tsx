'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import Button from '@/components/Button';
import ClientImage from '@/components/ClientImage';
import styles from './page.module.css';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const SingleMapDynamic = dynamic(() => import('@/components/SingleListingMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoadingSkeleton}>Načítání polohy na mapě...</div>
});

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [session, setSession] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('/placeholder.jpg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      const { id } = resolvedParams;
      
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
    
      if (error || !data) {
        notFound();
      } else {
        setListing(data as Listing);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params]);

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Načítám inzerát...</div>;
  }

  if (!listing) return null;
  
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  });

  return (
    <div className="container">
      <div className={styles.breadcrumb}>
        <Link href="/listings" className={styles.backLink}>
          &larr; Zpět na nabídky
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <ClientImage 
              src={activeImage} 
              alt={listing.title} 
              className={styles.image}
              fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23eaeaea%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22300%22%20fill%3D%22%23999999%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%3ENen%C3%AD%20fotografie%3C%2Ftext%3E%3C%2Fsvg%3E"
            />
          </div>
          
          {listing.images && listing.images.length > 1 && (
            <div className={styles.thumbnailGrid}>
              {listing.images.map((img, index) => (
                <div 
                  key={index} 
                  className={styles.thumbnailWrapper} 
                  style={{ opacity: activeImage === img ? 1 : 0.6, borderColor: activeImage === img ? 'var(--accent-text)' : 'var(--border)' }}
                  onClick={() => setActiveImage(img)}
                >
                  <ClientImage 
                    src={img} 
                    alt={`${listing.title} - foto ${index + 1}`} 
                    className={styles.thumbnailImage}
                    fallbackSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23eaeaea%22%2F%3E%3C%2Fsvg%3E"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>{listing.title}</h1>
            <p className={styles.location}>
              {listing.street_address ? `${listing.street_address}, ${listing.location}` : listing.location}
            </p>
            <div className={styles.price}>{formatter.format(listing.price)}</div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Podíl</span>
              <span className={styles.value}>{listing.share_size}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Typ nemovitosti</span>
              <span className={styles.value}>{listing.property_type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Odhad ceny celku</span>
              <span className={styles.value}>
                {listing.full_property_value ? formatter.format(listing.full_property_value) : 'Neuvedeno'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Obsazenost</span>
              <span className={styles.value}>{listing.occupancy || 'Neuvedeno'}</span>
            </div>
          </div>
          
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Popis podílu</h2>
            <div className={styles.description}>
              {listing.description ? (
                listing.description.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))
              ) : (
                <p className={styles.mutedText}>Prodejce neuvedl další popis.</p>
              )}
            </div>
          </div>

          {listing.lat && listing.lng && (
            <div className={styles.mapSection}>
              <h2 className={styles.sectionTitle}>Přesná lokalita</h2>
              <p className={styles.mutedText} style={{ marginBottom: '1rem' }}>
                 {listing.street_address ? `${listing.street_address}, ${listing.location}` : listing.location}
              </p>
              <SingleMapDynamic listing={listing} />
            </div>
          )}

          <div className={styles.contactCard}>
            <h3 className={styles.contactTitle}>Máte zájem o tento podíl?</h3>
            <p className={styles.contactSubtitle}>Spojte se přímo s prodejcem a domluvte se na detailech.</p>
            
            {listing.contact_phone && (
              <div className={styles.phoneBox}>
                <span className={styles.phoneLabel}>Telefonní číslo prodejce</span>
                {session ? (
                  <a href={`tel:${listing.contact_phone}`} className={styles.phoneNumber}>
                    {listing.contact_phone}
                  </a>
                ) : (
                  <div className={styles.phoneHiddenWrapper}>
                    <span className={styles.phoneHidden}>+420 123 456 789</span>
                    <p className={styles.phoneLoginPrompt}>
                      Pro zobrazení čísla se <Link href="/login" className={styles.loginLink}>přihlaste</Link>.
                    </p>
                  </div>
                )}
              </div>
            )}

            <a href={`mailto:${listing.contact_email}?subject=Zájem o nabídku z Podilo: ${listing.title}`}>
              <Button fullWidth>Napsat e-mail prodejci</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
