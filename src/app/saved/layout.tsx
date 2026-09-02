import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uložené nabídky | Podilo',
  description: 'Váš watchlist podílů nemovitostí, které chcete sledovat a porovnat.',
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
