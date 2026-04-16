import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono, Syne, DM_Mono } from 'next/font/google'
import Providers from './Providers'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ['400', '700', '800'] });
const dmMono = DM_Mono({ subsets: ["latin"], weight: '400', variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: 'ORCA - Your Company. Automated. Completely.',
  description: 'Enterprise AI automation platform for complete business automation',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${syne.variable} ${dmMono.variable} dark`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="font-body antialiased bg-surface text-on-surface">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
