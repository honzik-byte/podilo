import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moje inzeráty | Podilo',
  description: 'Správa vašich nabídek spoluvlastnických podílů, poptávky od zájemců a stav viditelnosti inzerátů.',
};

export default function MyListingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
