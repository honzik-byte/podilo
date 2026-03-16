import type { Metadata } from 'next'
import './globals.css'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Podilo - Tržiště podílů nemovitostí',
  description: 'Minimalistický online marketplace zaměřený výhradně na prodej a nákup podílů nemovitostí.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
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
