'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import { ListingDetails, serializeListingDescription } from '@/lib/listingMetadata';
import styles from './AddListingForm.module.css';

const propertyTypes = ['Byt', 'Rodinný dům', 'Pozemek', 'Komerční objekt', 'Garáž'];

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const details: ListingDetails = {
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

    const data = {
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
      description: serializeListingDescription((formData.get('description') as string) || '', details),
      contact_email: formData.get('contact_email') as string,
      contact_phone: (formData.get('contact_phone') as string) || null,
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
          const searchQuery = data.street_address ? `${data.street_address}, ${data.location}` : data.location;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
          );
          if (response.ok) {
            const geoData: Array<{ lat: string; lon: string }> = await response.json();
            if (geoData.length > 0) {
              lat = parseFloat(geoData[0].lat);
              lng = parseFloat(geoData[0].lon);
            }
          }
        } catch (geocodingError) {
          console.warn('Geocoding failed', geocodingError);
        }
      }

      const listingData = {
        ...data,
        lat,
        lng,
      };

      const fileInput = document.getElementById('image') as HTMLInputElement | null;
      if (fileInput?.files?.length) {
        for (let index = 0; index < fileInput.files.length; index += 1) {
          const file = fileInput.files[index];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('listing_images')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('listing_images').getPublicUrl(filePath);

          data.images.push(publicUrl);
        }
      }

      const { data: insertedListing, error: insertError } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      router.push(`/listings/${insertedListing.id}`);
      router.refresh();
    } catch (submitError: unknown) {
      console.error(submitError);
      setError(
        submitError instanceof Error ? submitError.message : 'Nastala chyba při ukládání inzerátu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formHeader}>
        <div>
          <p className={styles.eyebrow}>Vložení nabídky</p>
          <h2 className={styles.formTitle}>Jednoduchý základ, detailní prezentace jen pokud chcete</h2>
        </div>
        <p className={styles.formIntro}>
          Povinná jsou jen klíčová data. Volitelné sekce pomohou investorům lépe pochopit situaci a zvýší důvěryhodnost nabídky.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>1. Základní informace</h3>
          <p className={styles.sectionText}>Tohle je minimum, podle kterého zájemce pochopí, co přesně nabízíte.</p>
        </div>

        <div className="form-group">
          <label htmlFor="title" className="label">Nadpis inzerátu *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="input"
            placeholder="Např. 1/2 podílu na rodinném domě se zahradou v Brně"
          />
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="property_type" className="label">Typ nemovitosti *</label>
            <select id="property_type" name="property_type" required className="select">
              <option value="">Vyberte typ</option>
              {propertyTypes.map((propertyType) => (
                <option key={propertyType} value={propertyType}>
                  {propertyType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="share_size" className="label">Velikost podílu *</label>
            <input
              type="text"
              id="share_size"
              name="share_size"
              required
              className="input"
              placeholder="Např. 1/2, 1/3, 1/6"
            />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="street_address" className="label">Přesná adresa ulice a č.p. *</label>
            <input
              type="text"
              id="street_address"
              name="street_address"
              required
              className="input"
              placeholder="Např. Nádražní 123"
            />
            <p className={styles.helper}>Adresa pomůže zobrazit přesnější lokaci na mapě.</p>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="label">Město / obec *</label>
            <input
              type="text"
              id="location"
              name="location"
              required
              className="input"
              placeholder="Např. Praha 5 - Smíchov"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>2. Cena a investor kontext</h3>
          <p className={styles.sectionText}>
            U ceny jasně oddělte hodnotu podílu od hodnoty celé nemovitosti. Tím snižujete nejasnost a posilujete důvěru.
          </p>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="price" className="label">Cena za nabízený podíl (Kč) *</label>
            <input type="number" id="price" name="price" required className="input" min="1" placeholder="Např. 2500000" />
          </div>

          <div className="form-group">
            <label htmlFor="full_property_value" className="label">Odhad ceny celé nemovitosti (Kč)</label>
            <input
              type="number"
              id="full_property_value"
              name="full_property_value"
              className="input"
              min="1"
              placeholder="Např. 10000000"
            />
          </div>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="occupancy" className="label">Obsazenost</label>
            <select id="occupancy" name="occupancy" className="select">
              <option value="">Neuvedeno</option>
              <option value="Volné">Volné</option>
              <option value="Pronajato">Pronajato</option>
              <option value="Obsazeno spoluvlastníkem">Obsazeno spoluvlastníkem</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="opportunity_type" className="label">Typ příležitosti</label>
            <select id="opportunity_type" name="opportunity_type" className="select">
              <option value="">Neuvedeno</option>
              <option value="Investiční">Investiční</option>
              <option value="Rychlý prodej">Rychlý prodej</option>
              <option value="Spoluvlastnické vypořádání">Spoluvlastnické vypořádání</option>
            </select>
          </div>
        </div>
      </div>

      <details className={styles.optionalBlock} open>
        <summary className={styles.optionalSummary}>
          <span>3. Rozšířená prezentace nabídky</span>
          <span className={styles.optionalTag}>Volitelné</span>
        </summary>
        <div className={styles.optionalContent}>
          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="disposition" className="label">Dispozice</label>
              <input type="text" id="disposition" name="disposition" className="input" placeholder="Např. 3+kk" />
            </div>
            <div className="form-group">
              <label htmlFor="usable_area" className="label">Užitná plocha / výměra</label>
              <input type="text" id="usable_area" name="usable_area" className="input" placeholder="Např. 82 m2" />
            </div>
          </div>

          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="room_count" className="label">Počet místností</label>
              <input type="text" id="room_count" name="room_count" className="input" placeholder="Např. 4" />
            </div>
            <div className="form-group">
              <label htmlFor="property_condition" className="label">Stav nemovitosti</label>
              <input type="text" id="property_condition" name="property_condition" className="input" placeholder="Např. po rekonstrukci" />
            </div>
          </div>

          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="floor" className="label">Patro</label>
              <input type="text" id="floor" name="floor" className="input" placeholder="Např. 3. patro" />
            </div>
            <div className="form-group">
              <label htmlFor="elevator" className="label">Výtah</label>
              <select id="elevator" name="elevator" className="select">
                <option value="">Neuvedeno</option>
                <option value="Ano">Ano</option>
                <option value="Ne">Ne</option>
              </select>
            </div>
          </div>

          <div className={styles.checkPills}>
            <label><input type="checkbox" name="balcony" /> Balkon</label>
            <label><input type="checkbox" name="terrace" /> Terasa</label>
            <label><input type="checkbox" name="cellar" /> Sklep</label>
            <label><input type="checkbox" name="parking" /> Parkování</label>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="label">Hlavní popis nabídky</label>
            <textarea
              id="description"
              name="description"
              className="textarea"
              placeholder="Shrňte stav podílu, co je jeho hlavní výhoda, jaká je situace v nemovitosti a co by měl vědět zájemce."
            />
          </div>

          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="location_detail" className="label">Přesnější popis lokality</label>
              <textarea id="location_detail" name="location_detail" className="textarea" placeholder="Dostupnost MHD, občanská vybavenost, charakter lokality..." />
            </div>
            <div className="form-group">
              <label htmlFor="benefits" className="label">Benefity nemovitosti</label>
              <textarea id="benefits" name="benefits" className="textarea" placeholder="Silné stránky nabídky, které pomohou při rozhodování." />
            </div>
          </div>
        </div>
      </details>

      <details className={styles.optionalBlock}>
        <summary className={styles.optionalSummary}>
          <span>4. Pokročilé investor informace</span>
          <span className={styles.optionalTag}>Volitelné</span>
        </summary>
        <div className={styles.optionalContent}>
          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="current_use" className="label">Aktuální využití</label>
              <input type="text" id="current_use" name="current_use" className="input" placeholder="Např. užívá rodina spoluvlastníka" />
            </div>
            <div className="form-group">
              <label htmlFor="tenancy" className="label">Nájemní vztah</label>
              <input type="text" id="tenancy" name="tenancy" className="input" placeholder="Např. bez nájemní smlouvy / pronajato do..." />
            </div>
          </div>

          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="co_owner_count" className="label">Počet spoluvlastníků</label>
              <input type="text" id="co_owner_count" name="co_owner_count" className="input" placeholder="Např. 3" />
            </div>
            <div className="form-group">
              <label htmlFor="listing_status" className="label">Stav nabídky</label>
              <select id="listing_status" name="listing_status" className="select">
                <option value="">Aktivní</option>
                <option value="Aktivní">Aktivní</option>
                <option value="V jednání">V jednání</option>
                <option value="Rezervováno">Rezervováno</option>
              </select>
            </div>
          </div>

          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="sale_reason" className="label">Důvod prodeje</label>
              <textarea id="sale_reason" name="sale_reason" className="textarea" placeholder="Např. vypořádání dědictví, zájem o rychlý odprodej..." />
            </div>
            <div className="form-group">
              <label htmlFor="investment_potential" className="label">Investiční potenciál</label>
              <textarea id="investment_potential" name="investment_potential" className="textarea" placeholder="Proč může nabídka dávat smysl investorovi nebo spoluvlastníkovi." />
            </div>
          </div>

          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="legal_note" className="label">Právní poznámka</label>
              <textarea id="legal_note" name="legal_note" className="textarea" placeholder="Krátká poznámka k právnímu stavu nebo dokumentům k dispozici." />
            </div>
            <div className="form-group">
              <label htmlFor="financing_options" className="label">Možnost financování / dohody</label>
              <textarea id="financing_options" name="financing_options" className="textarea" placeholder="Např. prostor pro rychlou dohodu, preference termínu, forma úhrady..." />
            </div>
          </div>
        </div>
      </details>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>5. Fotografie a kontakt</h3>
          <p className={styles.sectionText}>Kvalitní fotky a jasný kontakt výrazně zvyšují šanci na relevantní poptávky.</p>
        </div>

        <div className="form-group">
          <label htmlFor="image" className="label">Fotografie</label>
          <input type="file" id="image" name="image" accept="image/*" multiple className="input" style={{ padding: '0.6rem' }} />
          <p className={styles.helper}>Můžete nahrát více fotografií. První bude použitá jako hlavní.</p>
        </div>

        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="contact_email" className="label">Kontaktní e-mail *</label>
            <input type="email" id="contact_email" name="contact_email" required className="input" placeholder="email@priklad.cz" />
          </div>

          <div className="form-group">
            <label htmlFor="contact_phone" className="label">Telefonní číslo</label>
            <input type="tel" id="contact_phone" name="contact_phone" className="input" placeholder="+420 123 456 789" />
            <p className={styles.helper}>Telefon zobrazujeme pouze přihlášeným uživatelům.</p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.actionNote}>
          Inzerát je možné zveřejnit i bez vyplnění volitelných sekcí. Čím více kontextu ale doplníte, tím lépe se bude investorům vyhodnocovat.
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ukládám...' : 'Zveřejnit inzerát'}
        </Button>
      </div>
    </form>
  );
}
