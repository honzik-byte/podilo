import AddListingForm from '@/components/AddListingForm';

export const metadata = {
  title: 'Přidat inzerát - Podilo',
};

export default function AddListingPage() {
  return (
    <div className="container" style={{ maxWidth: '800px', paddingBottom: '5rem' }}>
      <div style={{ padding: '4rem 0 3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.8rem', letterSpacing: '-0.02em' }}>
          Prodáváte podíl?
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '1.1rem' }}>
          Vyplňte formulář níže a nabídněte svůj spoluvlastnický podíl investorům a dalším zájemcům.
        </p>
      </div>

      <AddListingForm />
    </div>
  );
}
