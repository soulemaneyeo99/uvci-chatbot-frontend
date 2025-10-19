import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Assistant UVCI - Chatbot Intelligent',
  description: 'Votre guide intelligent pour tout savoir sur l\'Université Virtuelle de Côte d\'Ivoire',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
