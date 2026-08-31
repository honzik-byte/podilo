import type { Metadata } from 'next'
import { Inter, Libre_Caslon_Text } from 'next/font/google'
import './globals.css'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' })
const libreCaslonText = Libre_Caslon_Text({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  variable: '--font-caslon',
})

export const metadata: Metadata = {
  title: 'Podilo - Tržiště podílů nemovitostí',
  description: 'Minimalistický online marketplace zaměřený výhradně na prodej a nákup podílů nemovitostí.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
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
