import Link from 'next/link';
import SuccessActivation from './SuccessActivation';
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

  return <SuccessActivation sessionId={sessionId} />;
}
