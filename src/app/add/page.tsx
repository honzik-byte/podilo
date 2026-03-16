import AddListingForm from '@/components/AddListingForm';

export const metadata = {
  title: 'Přidat inzerát - Podilo',
};

export default function AddListingPage() {
  return (
    <div className="container" style={{ maxWidth: '980px', paddingBottom: '5rem' }}>
      <div style={{ padding: '4.5rem 0 2rem', display: 'grid', gap: '1rem' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', color: 'var(--muted-text)', fontWeight: 800 }}>
          Pro prodávající
        </p>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.05em', lineHeight: 1.05 }}>
          Vložte podíl tak, aby mu investor rychle porozuměl
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '1.08rem', lineHeight: 1.7, maxWidth: '65ch' }}>
          Základ zvládnete vyplnit během pár minut. Volitelné sekce vám pomohou lépe vysvětlit cenu, obsazenost i investiční souvislosti nabídky.
        </p>
      </div>

      <AddListingForm />
    </div>
  );
}
