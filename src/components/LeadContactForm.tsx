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

    const formData = new FormData(event.currentTarget);
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
        }),
      });

      if (!response.ok) {
        throw new Error('Poptávku se nepodařilo odeslat.');
      }

      event.currentTarget.reset();
      setMessage(`Poptávka k nabídce „${listingTitle}“ byla odeslána.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Poptávku se nepodařilo odeslat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
