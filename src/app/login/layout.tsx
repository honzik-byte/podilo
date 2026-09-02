import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Přihlášení | Podilo',
  description: 'Přihlaste se k účtu Podilo a spravujte své inzeráty, uložené nabídky a kontakty na prodávající.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
