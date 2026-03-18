import type { Metadata } from 'next'
import { Syne, DM_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

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
    <html lang="en" className={`${syne.variable} ${dmMono.variable} dark`}>
      <body className="font-sans antialiased bg-bg text-text-body">
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}

