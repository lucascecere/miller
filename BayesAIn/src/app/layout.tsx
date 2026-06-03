import type { Metadata } from 'next'
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://lukemillerphd.org'),
  title: {
    default: 'Luke Miller, PhD — Bayesian Decision Systems',
    template: '%s | Luke Miller, PhD',
  },
  description:
    'Finance professor at Saint Anselm College. Bayesian timing analyst applying a probabilistic framework to equity, energy, and metals markets since 2007.',
  openGraph: {
    type: 'website',
    siteName: 'Luke Miller, PhD',
    locale: 'en_US',
    url: 'https://lukemillerphd.org',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Luke Miller, PhD — Bayesian Decision Systems' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: 'Luke Miller',
      honorificSuffix: 'PhD',
      jobTitle: 'Associate Professor of Economics & Business and Bayesian Timing Analyst',
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Saint Anselm College',
      },
      url: 'https://lukemillerphd.org',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      name: 'Luke Miller, PhD',
      url: 'https://lukemillerphd.org',
    },
    {
      '@type': 'ProfessionalService',
      name: 'Luke Miller, PhD — Consulting',
      description:
        'Bayesian decision frameworks for strategic and operational problems.',
      url: 'https://lukemillerphd.org/consulting',
      areaServed: 'Worldwide',
      knowsAbout: [
        'Bayesian decision systems',
        'probabilistic modeling',
        'quantitative strategy',
        'financial engineering',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Insights — Luke Miller, PhD"
          href="/insights/rss.xml"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lm-surface focus:text-lm-cream focus:rounded-sm focus:text-sm focus:font-sans"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
