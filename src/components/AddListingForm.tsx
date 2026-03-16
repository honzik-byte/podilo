'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import styles from './AddListingForm.module.css';

export default function AddListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      }
    });
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      street_address: formData.get('street_address') as string,
      property_type: formData.get('property_type') as string,
      share_size: formData.get('share_size') as string,
      price: Number(formData.get('price')),
      full_property_value: formData.get('full_property_value') ? Number(formData.get('full_property_value')) : null,
      occupancy: formData.get('occupancy') as string,
      description: formData.get('description') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string || null,
      images: [] as string[],
      user_id: '',
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Pro přidání inzerátu musíte být přihlášeni.');
      }
      data.user_id = sessionData.session.user.id;

      let lat = null;
      let lng = null;
      if (data.location) {
        try {
          // If street address is provided, try to geocode the full address for better accuracy
          const searchQuery = data.street_address 
            ? `${data.street_address}, ${data.location}`
            : data.location;
            
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const geoData = await res.json();
            if (geoData && geoData.length > 0) {
              lat = parseFloat(geoData[0].lat);
              lng = parseFloat(geoData[0].lon);
            }
          }
        } catch (e) {
          console.warn("Geocoding failed", e);
        }
      }

      const listingData = {
        ...data,
        lat,
        lng,
      };

      // 1. Upload Files (if present)
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          const file = fileInput.files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('listing_images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('listing_images')
            .getPublicUrl(filePath);

          data.images.push(publicUrl);
        }
      }

      // 2. Insert into DB
      const { data: insertedListing, error: insertError } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // 3. Redirect to the newly created listing
      router.push(`/listings/${insertedListing.id}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nastala chyba při ukládání inzerátu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Základní informace</h2>
        
        <div className="form-group">
          <label htmlFor="title" className="label">Nadpis inzerátu *</label>
          <input type="text" id="title" name="title" required className="input" placeholder="Např. 1/2 ideálního podílu na rodinném domě v Brně" />
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="property_type" className="label">Typ nemovitosti *</label>
            <select id="property_type" name="property_type" required className="select">
              <option value="">Vyberte typ</option>
              <option value="Byt">Byt</option>
              <option value="Rodinný dům">Rodinný dům</option>
              <option value="Pozemek">Pozemek</option>
              <option value="Komerční objekt">Komerční objekt</option>
              <option value="Garáž">Garáž</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="share_size" className="label">Velikost podílu *</label>
            <input type="text" id="share_size" name="share_size" required className="input" placeholder="Např. 1/2, 1/4" />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="street_address" className="label">Přesná adresa ulice a č.p. *</label>
            <input type="text" id="street_address" name="street_address" required className="input" placeholder="Např. Nádražní 123" />
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '0.25rem' }}>Slouží k přesnému zobrazení pinu na mapě.</p>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="label">Lokalita (Město / Obec) *</label>
            <input type="text" id="location" name="location" required className="input" placeholder="Např. Praha 5 - Smíchov" />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cena a stav</h2>
        
        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="price" className="label">Cena za podíl (Kč) *</label>
            <input type="number" id="price" name="price" required className="input" min="1" placeholder="Např. 2500000" />
          </div>

          <div className="form-group">
            <label htmlFor="full_property_value" className="label">Odhad ceny celé nemovitosti (Kč)</label>
            <input type="number" id="full_property_value" name="full_property_value" className="input" min="1" placeholder="Např. 10000000" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="occupancy" className="label">Obsazenost / Stav</label>
          <select id="occupancy" name="occupancy" className="select">
            <option value="">Vyberte stav</option>
            <option value="Volné, ihned k užívání">Volné, ihned k užívání</option>
            <option value="Pronajato, s nájemníkem">Pronajato, s nájemníkem</option>
            <option value="Užíváno ostatními spoluvlastníky">Užíváno ostatními spoluvlastníky</option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Detaily</h2>
        
        <div className="form-group">
          <label htmlFor="description" className="label">Popis (Nepovinné)</label>
          <textarea id="description" name="description" className="textarea" placeholder="Popište stav, právní vztahy, důvod prodeje..."></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image" className="label">Fotografie (Nepovinné, můžete vybrat více fotografií)</label>
          <input type="file" id="image" name="image" accept="image/*" multiple className="input" style={{ padding: '0.6rem' }} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Kontakt</h2>
        
        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="contact_email" className="label">Váš kontaktní e-mail *</label>
            <input type="email" id="contact_email" name="contact_email" required className="input" placeholder="email@priklad.cz" />
          </div>

          <div className="form-group">
            <label htmlFor="contact_phone" className="label">Telefonní číslo (Nepovinné)</label>
            <input type="tel" id="contact_phone" name="contact_phone" className="input" placeholder="+420 123 456 789" />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ukládám...' : 'Zveřejnit inzerát zdarma'}
        </Button>
      </div>
    </form>
  );
}
