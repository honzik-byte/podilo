import type { Metadata } from 'next'
import { Inter, Libre_Caslon_Text } from 'next/font/google'
import './globals.css'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })
const libreCaslonText = Libre_Caslon_Text({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  variable: '--font-caslon',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://podilo.cz'
const title = 'Podilo — Tržiště spoluvlastnických podílů nemovitostí'
const description = 'Kupujte a prodávejte podíly nemovitostí s větší jistotou. Ověřené nabídky, jasná dokumentace a přímé spojení s vlastníkem — bez zbytečných zprostředkovatelů.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'Podilo',
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className={`${inter.variable} ${libreCaslonText.variable}`}>
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 150px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
