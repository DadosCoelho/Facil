// Facil/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Mantenha as propriedades restantes em metadata
export const metadata: Metadata = {
  title: 'Facil — Plataforma de Apostas',
  description: 'Plataforma web para gestão de apostas da Lotofácil da Independência',
  keywords: 'lotofácil, apostas, independência, facil',
  authors: [{ name: 'Facil Team' }],
  // viewport e themeColor foram movidos para a exportação 'viewport' abaixo
}

// CRIE esta nova exportação para viewport
export const viewport = {
  width: 'device-width',
  initialScale: 1,
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