'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import { ListingDetails, parseListing, serializeListingDescription } from '@/lib/listingMetadata';
import Button from '@/components/Button';
import styles from './page.module.css';

const propertyTypes = ['Byt', 'Rodinný dům', 'Pozemek', 'Komerční objekt', 'Garáž'];

export default function AdminEditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [details, setDetails] = useState<ListingDetails>({});
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      const { id } = resolvedParams;

      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (!roleData || roleData.role !== 'admin') {
        router.push('/admin');
        return;
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (!data) {
        const localResponse = await fetch(`/api/local-listings/${id}`);
        if (!localResponse.ok) {
          setError('Inzerát se nepodařilo načíst.');
          setLoading(false);
          return;
        }

        const localListing = (await localResponse.json()) as Listing;
        const parsed = parseListing(localListing);
        setListing(localListing);
        setDetails(parsed.details);
        setDescription(parsed.description);
        setLoading(false);
        return;
      }

      const parsed = parseListing(data as Listing);
      setListing(data as Listing);
      setDetails(parsed.details);
      setDescription(parsed.description);
      setLoading(false);
    };

    void init();
  }, [params, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!listing) {
      return;
    }

    setSaving(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const nextDetails: ListingDetails = {
      disposition: (formData.get('disposition') as string) || undefined,
      usableArea: (formData.get('usable_area') as string) || undefined,
      roomCount: (formData.get('room_count') as string) || undefined,
      propertyCondition: (formData.get('property_condition') as string) || undefined,
      floor: (formData.get('floor') as string) || undefined,
      elevator: (formData.get('elevator') as string) || undefined,
      balcony: formData.get('balcony') === 'on',
      terrace: formData.get('terrace') === 'on',
      cellar: formData.get('cellar') === 'on',
      parking: formData.get('parking') === 'on',
      currentUse: (formData.get('current_use') as string) || undefined,
      tenancy: (formData.get('tenancy') as string) || undefined,
      coOwnerCount: (formData.get('co_owner_count') as string) || undefined,
      saleReason: (formData.get('sale_reason') as string) || undefined,
      legalNote: (formData.get('legal_note') as string) || undefined,
      investmentPotential: (formData.get('investment_potential') as string) || undefined,
      locationDetail: (formData.get('location_detail') as string) || undefined,
      benefits: (formData.get('benefits') as string) || undefined,
      financingOptions: (formData.get('financing_options') as string) || undefined,
      opportunityType: (formData.get('opportunity_type') as string) || undefined,
      listingStatus: (formData.get('listing_status') as string) || undefined,
    };

    const updatePayload = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      street_address: formData.get('street_address') as string,
      property_type: formData.get('property_type') as string,
      share_size: formData.get('share_size') as string,
      price: Number(formData.get('price')),
      full_property_value: formData.get('full_property_value')
        ? Number(formData.get('full_property_value'))
        : null,
      occupancy: (formData.get('occupancy') as string) || null,
      description: serializeListingDescription((formData.get('description') as string) || '', nextDetails),
      contact_email: formData.get('contact_email') as string,
      contact_phone: (formData.get('contact_phone') as string) || null,
      images: String(formData.get('images') || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      is_top: formData.get('is_top') === 'on',
      is_highlighted: formData.get('is_highlighted') === 'on',
    };

    if (listing.id.startsWith('local-')) {
      const localResponse = await fetch(`/api/local-listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!localResponse.ok) {
        setError('Lokální inzerát se nepodařilo uložit.');
        setSaving(false);
        return;
      }

      router.push('/admin');
      router.refresh();
      return;
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update(updatePayload)
      .eq('id', listing.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  if (loading) {
    return <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>Načítám inzerát...</div>;
  }

  if (!session || !listing) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p>{error || 'Inzerát nebyl nalezen.'}</p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <Link href="/admin" className={styles.backLink}>← Zpět do administrace</Link>
          <h1 className={styles.title}>Upravit inzerát</h1>
          <p className={styles.subtitle}>Jako admin můžete upravit základní i rozšířená pole inzerátu.</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="title" className="label">Nadpis</label>
            <input id="title" name="title" className="input" required defaultValue={listing.title} />
          </div>
          <div className="form-group">
            <label htmlFor="property_type" className="label">Typ nemovitosti</label>
            <select id="property_type" name="property_type" className="select" defaultValue={listing.property_type}>
              {propertyTypes.map((propertyType) => (
                <option key={propertyType} value={propertyType}>{propertyType}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="share_size" className="label">Velikost podílu</label>
            <input id="share_size" name="share_size" className="input" required defaultValue={listing.share_size} />
          </div>
          <div className="form-group">
            <label htmlFor="price" className="label">Cena za nabízený podíl</label>
            <input id="price" name="price" type="number" className="input" required defaultValue={listing.price} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="full_property_value" className="label">Odhad ceny celé nemovitosti</label>
            <input
              id="full_property_value"
              name="full_property_value"
              type="number"
              className="input"
              defaultValue={listing.full_property_value ?? ''}
            />
          </div>
          <div className="form-group">
            <label htmlFor="occupancy" className="label">Obsazenost</label>
            <select id="occupancy" name="occupancy" className="select" defaultValue={listing.occupancy || ''}>
              <option value="">Neuvedeno</option>
              <option value="Volné">Volné</option>
              <option value="Pronajato">Pronajato</option>
              <option value="Obsazeno spoluvlastníkem">Obsazeno spoluvlastníkem</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="street_address" className="label">Ulice a č.p.</label>
            <input id="street_address" name="street_address" className="input" required defaultValue={listing.street_address} />
          </div>
          <div className="form-group">
            <label htmlFor="location" className="label">Lokalita</label>
            <input id="location" name="location" className="input" required defaultValue={listing.location} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="label">Hlavní popis</label>
          <textarea
            id="description"
            name="description"
            className="textarea"
            defaultValue={description}
          />
        </div>

        <div className={styles.sectionTitle}>Rozšířená pole</div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="disposition" className="label">Dispozice</label>
            <input id="disposition" name="disposition" className="input" defaultValue={details.disposition || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="usable_area" className="label">Užitná plocha</label>
            <input id="usable_area" name="usable_area" className="input" defaultValue={details.usableArea || ''} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="room_count" className="label">Počet místností</label>
            <input id="room_count" name="room_count" className="input" defaultValue={details.roomCount || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="property_condition" className="label">Stav nemovitosti</label>
            <input id="property_condition" name="property_condition" className="input" defaultValue={details.propertyCondition || ''} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="floor" className="label">Patro</label>
            <input id="floor" name="floor" className="input" defaultValue={details.floor || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="elevator" className="label">Výtah</label>
            <select id="elevator" name="elevator" className="select" defaultValue={details.elevator || ''}>
              <option value="">Neuvedeno</option>
              <option value="Ano">Ano</option>
              <option value="Ne">Ne</option>
            </select>
          </div>
        </div>

        <div className={styles.checks}>
          <label><input type="checkbox" name="balcony" defaultChecked={Boolean(details.balcony)} /> Balkon</label>
          <label><input type="checkbox" name="terrace" defaultChecked={Boolean(details.terrace)} /> Terasa</label>
          <label><input type="checkbox" name="cellar" defaultChecked={Boolean(details.cellar)} /> Sklep</label>
          <label><input type="checkbox" name="parking" defaultChecked={Boolean(details.parking)} /> Parkování</label>
          <label><input type="checkbox" name="is_top" defaultChecked={listing.is_top} /> TOP nabídka</label>
          <label><input type="checkbox" name="is_highlighted" defaultChecked={listing.is_highlighted} /> Zvýrazněná</label>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="current_use" className="label">Aktuální využití</label>
            <input id="current_use" name="current_use" className="input" defaultValue={details.currentUse || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="tenancy" className="label">Nájemní vztah</label>
            <input id="tenancy" name="tenancy" className="input" defaultValue={details.tenancy || ''} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="co_owner_count" className="label">Počet spoluvlastníků</label>
            <input id="co_owner_count" name="co_owner_count" className="input" defaultValue={details.coOwnerCount || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="opportunity_type" className="label">Typ příležitosti</label>
            <select id="opportunity_type" name="opportunity_type" className="select" defaultValue={details.opportunityType || ''}>
              <option value="">Neuvedeno</option>
              <option value="Investiční">Investiční</option>
              <option value="Rychlý prodej">Rychlý prodej</option>
              <option value="Spoluvlastnické vypořádání">Spoluvlastnické vypořádání</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="listing_status" className="label">Stav nabídky</label>
            <select id="listing_status" name="listing_status" className="select" defaultValue={details.listingStatus || ''}>
              <option value="">Aktivní</option>
              <option value="Aktivní">Aktivní</option>
              <option value="V jednání">V jednání</option>
              <option value="Rezervováno">Rezervováno</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="contact_email" className="label">Kontaktní e-mail</label>
            <input id="contact_email" name="contact_email" className="input" defaultValue={listing.contact_email} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="contact_phone" className="label">Telefon</label>
            <input id="contact_phone" name="contact_phone" className="input" defaultValue={listing.contact_phone || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="images" className="label">URL fotografií</label>
            <textarea id="images" name="images" className="textarea" defaultValue={(listing.images || []).join('\n')} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="location_detail" className="label">Přesnější popis lokality</label>
            <textarea id="location_detail" name="location_detail" className="textarea" defaultValue={details.locationDetail || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="benefits" className="label">Benefity nemovitosti</label>
            <textarea id="benefits" name="benefits" className="textarea" defaultValue={details.benefits || ''} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="investment_potential" className="label">Investiční potenciál</label>
            <textarea id="investment_potential" name="investment_potential" className="textarea" defaultValue={details.investmentPotential || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="sale_reason" className="label">Důvod prodeje</label>
            <textarea id="sale_reason" name="sale_reason" className="textarea" defaultValue={details.saleReason || ''} />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="legal_note" className="label">Právní poznámka</label>
            <textarea id="legal_note" name="legal_note" className="textarea" defaultValue={details.legalNote || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="financing_options" className="label">Možnost financování / dohody</label>
            <textarea id="financing_options" name="financing_options" className="textarea" defaultValue={details.financingOptions || ''} />
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="submit" disabled={saving}>
            {saving ? 'Ukládám...' : 'Uložit změny'}
          </Button>
        </div>
      </form>
    </div>
  );
}
