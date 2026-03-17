import Link from 'next/link';
import { activatePromotionFromSession } from '@/lib/promotionActivation';
import { getStripeClient } from '@/lib/stripeServer';
import styles from '../page.module.css';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PricingSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="container">
        <div className={styles.statusCard}>
          <h1>Chybí potvrzení platby</h1>
          <p>Do stránky nedorazilo ID platební session. Vraťte se prosím do ceníku a zkuste to znovu.</p>
          <Link href="/cenik" className={styles.inlineLink}>Zpět na ceník</Link>
        </div>
      </div>
    );
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await activatePromotionFromSession(session);

    return (
      <div className="container">
        <div className={styles.statusCard}>
          <p className={styles.statusEyebrow}>Platba dokončena</p>
          <h1>{result.plan.title} je aktivní</h1>
          <p>
            Inzerát <strong>{result.listingTitle || 'vybraná nabídka'}</strong> má nyní zapnuté zvýšení viditelnosti.
            Změna se propíše do výpisu po nejbližším načtení stránky.
          </p>
          <div className={styles.statusActions}>
            <Link href="/my-listings" className={styles.primaryLink}>Zpět do mých inzerátů</Link>
            <Link href={`/listings/${result.listingId}`} className={styles.secondaryLink}>Otevřít detail nabídky</Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container">
        <div className={styles.statusCard}>
          <h1>Platbu se nepodařilo potvrdit</h1>
          <p>
            {error instanceof Error ? error.message : 'Zkuste stránku obnovit nebo se vraťte do ceníku.'}
          </p>
          <Link href="/cenik" className={styles.inlineLink}>Zpět na ceník</Link>
        </div>
      </div>
    );
  }
}
