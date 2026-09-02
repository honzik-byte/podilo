import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrace | Podilo',
  description: 'Vytvořte si účet na Podilo. Získáte přístup k uloženým nabídkám, telefonním kontaktům a správě vlastních inzerátů.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
