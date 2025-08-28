import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Facil — Plataforma de Apostas',
  description: 'Plataforma web para gestão de apostas da Lotofácil da Independência',
  keywords: 'lotofácil, apostas, independência, facil',
  authors: [{ name: 'Facil Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6ee7b7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}
