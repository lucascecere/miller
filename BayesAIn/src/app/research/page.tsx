import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import Link from 'next/link'
import { buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Selected peer-reviewed publications by Dr. Luke Miller, PhD — financial engineering, Bayesian decision systems, and real options analysis.',
  alternates: { canonical: 'https://lukemillerphd.org/research' },
  openGraph: {
    title: 'Research | Luke Miller, PhD',
    description:
      'Selected peer-reviewed publications in financial engineering and Bayesian decision systems.',
    url: 'https://lukemillerphd.org/research',
  },
}

const publications = [
  'Development of a Bayesian Real Options Framework: And Its Application to Capital Budgeting Problems',
  'Bayesian Learning and Real Options: Valuing Strategic Investments',
  'Real Options Analysis: A New Standard for Decision-Making Under Uncertainty',
  'Using Risk-Adjusted Interest Rates in Option Pricing',
  'Bridging Decision Analysis and Real Options for Practical Valuation',
]

export default function ResearchPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        {/* Page Header */}
        <div className="pt-32 pb-16 border-b border-lm-border">
          <Container>
            <header className="max-w-2xl">
              <p className="font-mono text-xs text-lm-muted uppercase tracking-widest mb-4">
                Academic Work
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream mb-6">
                Research &amp; Publications
              </h1>
              <p className="text-lg text-lm-cream-muted max-w-2xl leading-relaxed">
                The academic foundation of the Bayesian timing methodology. Peer-reviewed publications in financial engineering and Bayesian decision systems.
              </p>
            </header>
          </Container>
        </div>

        {/* Peer-Reviewed Publications */}
        <Section>
          <Container>
            <div className="max-w-3xl">
              <p className="font-mono text-xs text-lm-muted uppercase tracking-widest mb-4">
                Peer-Reviewed Publications
              </p>
              <p className="text-sm text-lm-muted mb-8">
                Selected publications. A complete list is available on request via the{' '}
                <Link href="/contact" className="text-lm-cream-muted hover:text-lm-cream transition-colors underline underline-offset-2">
                  contact page
                </Link>.
              </p>
              <ol className="space-y-6 list-none">
                {publications.map((title, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-mono text-xs text-lm-muted flex-shrink-0 w-6 pt-1">{i + 1}.</span>
                    <div>
                      <span className="font-serif italic text-lm-cream-muted leading-relaxed">
                        &ldquo;{title}&rdquo;
                      </span>
                      <span className="font-mono text-xs text-lm-muted block mt-1">
                        Citation pending — full reference available on request.
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </Section>

        {/* Conference Presentations & Awards */}
        <Section className="border-t border-lm-border bg-lm-surface">
          <Container>
            <div className="max-w-3xl">
              <p className="font-mono text-xs text-lm-muted uppercase tracking-widest mb-8">
                Conference Presentations &amp; Awards
              </p>
              <div className="flex gap-4">
                <span className="font-mono text-xs text-lm-muted flex-shrink-0 w-6 pt-1">1.</span>
                <div>
                  <span className="text-lm-cream-muted leading-relaxed block">
                    Best Presentation Award — 18th International Conference on Business &amp; Finance
                  </span>
                  <span className="font-mono text-xs text-lm-muted block mt-1">
                    Paris, 2016
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema([
            { name: 'Home', url: 'https://lukemillerphd.org' },
            { name: 'Research', url: 'https://lukemillerphd.org/research' },
          ])),
        }}
      />
      <Footer />
    </>
  )
}
