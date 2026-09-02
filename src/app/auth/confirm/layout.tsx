import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Potvrzení e-mailu | Podilo',
  description: 'Dokončení registrace účtu na Podilo.',
  robots: { index: false, follow: false },
};

export default function ConfirmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
