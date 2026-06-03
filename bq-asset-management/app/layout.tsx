import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BQ Asset Management | Fee-Only Wealth Management',
  description:
    'BQ Asset Management is a fee-only, fiduciary Registered Investment Adviser serving high-net-worth individuals, families, and institutions.',
  openGraph: {
    title: 'BQ Asset Management | Fee-Only Wealth Management',
    description:
      'BQ Asset Management is a fee-only, fiduciary Registered Investment Adviser serving high-net-worth individuals, families, and institutions.',
    type: 'website',
    locale: 'en_US',
    // TODO: add og:image once brand photography is finalized
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BQ Asset Management | Fee-Only Wealth Management',
    description:
      'BQ Asset Management is a fee-only, fiduciary Registered Investment Adviser serving high-net-worth individuals, families, and institutions.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased" style={{ backgroundColor: '#FAFAF7', color: '#1A1F2B' }}>
        {children}
      </body>
    </html>
  )
}
