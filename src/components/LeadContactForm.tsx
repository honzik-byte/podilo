'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { isValidListingPhone } from '@/lib/listingFormValidation';
import styles from './LeadContactForm.module.css';

interface LeadContactFormProps {
  listingId: string;
  listingTitle: string;
}

export default function LeadContactForm({ listingId, listingTitle }: LeadContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get('phone') || '');

    if (phone && !isValidListingPhone(phone)) {
      setError('Telefon zadejte v platném formátu.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/leads/${listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone,
          message: formData.get('message'),
          website: formData.get('website'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Odeslání poptávky selhalo se stavem ${response.status}.`);
      }

      form.reset();
      setMessage(`Poptávka k nabídce „${listingTitle}“ byla odeslána.`);
    } catch (submitError) {
      console.error('[podilo] Odeslání poptávky selhalo:', submitError);
      setError('Poptávku se nepodařilo odeslat. Zkuste to prosím znovu, nebo napište na podpora@podilo.cz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
      />
      <div className={styles.grid}>
        <input name="name" className="input" placeholder="Jméno a příjmení" required />
        <input name="email" type="email" className="input" placeholder="E-mail" required />
      </div>
      <input name="phone" className="input" placeholder="Telefon (volitelné)" />
      <textarea
        name="message"
        className="textarea"
        placeholder="Napište krátce, o co máte zájem a kdy se vám hodí spojení."
        required
      />
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? 'Odesílám…' : 'Poslat poptávku'}
      </Button>
    </form>
  );
}
