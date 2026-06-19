import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import DisclaimerGate from '@/components/DisclaimerGate'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', weight: ['400', '700', '800'] })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'Artha Saya'
const SITE_DESCRIPTION = 'Share market insights explained simply — IPO analysis, stock education, mutual funds, and honest market commentary for Nepali investors. Free, always.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Share Market Insights`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['share market', 'Nepal', 'NEPSE', 'IPO', 'stocks', 'mutual funds', 'investment', 'सेयर बजार', 'Artha Saya'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Share Market Insights`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Share Market Insights`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <body className="bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
        <ThemeProvider>
          <DisclaimerGate>{children}</DisclaimerGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
