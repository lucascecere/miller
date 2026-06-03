import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Page Not Found | Luke Miller, PhD',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24 flex-1">
        <Container>
          <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">404</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream mb-6">Page not found</h1>
          <p className="text-lm-cream-muted mb-10 max-w-md leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>
          <nav className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">← Home</Link>
            <Link href="/insights" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">Insights</Link>
            <Link href="/research" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">Research</Link>
            <Link href="/contact" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">Contact</Link>
          </nav>
        </Container>
      </main>
      <Footer />
    </>
  )
}
