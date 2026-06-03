import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'The Strategy',
  description: 'A Bayesian decision framework for timing equity, energy, and metals markets. Actively traded since 2007, grounded in peer-reviewed academic research.',
  alternates: { canonical: 'https://lukemillerphd.org/the-strategy' },
  openGraph: {
    title: 'The Strategy | Luke Miller, PhD',
    description: 'A Bayesian timing methodology for equity indices, energy, and metals. Actively traded since 2007.',
    url: 'https://lukemillerphd.org/the-strategy',
  },
}

const comparisonColumns = [
  {
    heading: 'vs. Technical Analysis',
    body: 'Technical analysis identifies repeating chart patterns. This approach works with probability distributions over market states — updated continuously as evidence develops, not triggered by pattern recognition.',
  },
  {
    heading: 'vs. Quant Momentum',
    body: 'Momentum models chase past returns. The methodology generates forward-looking probability estimates that are revised as new information arrives — no trailing window, no look-back bias.',
  },
  {
    heading: 'vs. Discretionary',
    body: 'Discretionary trading relies on intuition refined by experience. The methodology makes that updating process explicit and systematic — so the decision logic can be examined, documented, and published.',
  },
]

const analysisSymbols = ['SPX', 'GDX', 'USO', 'DXY']
const signalSymbols = ['SPY', 'QQQ', 'IWM', 'GDX', 'SLV', 'GLD', 'USO', 'XBI', 'XLE', 'SMH']

const pedigreeItems = [
  {
    title: 'Actively traded since 2007',
    body: 'The methodology has been applied in live markets through the 2008 financial crisis, 2010 flash crash, 2020 COVID collapse, and every cycle in between.',
  },
  {
    title: 'PhD research foundation',
    body: 'Developed from doctoral work in financial engineering at Auburn University, where I was awarded the Gilbreth Memorial Fellowship — given to the nation\'s top doctoral student.',
  },
  {
    title: 'Peer-reviewed academic record',
    body: 'Published in 12+ peer-reviewed journals. Best Presentation Award, 18th International Conference on Business & Finance, Paris (2016).',
  },
]

export default function TheStrategyPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        {/* Header */}
        <section className="pt-32 pb-16 border-b border-lm-border">
          <Container>
            <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">Bayesian Timing</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream leading-tight mb-4">The Methodology</h1>
            <p className="text-xl text-lm-cream-muted leading-relaxed max-w-2xl">
              A Bayesian decision framework for timing equity, energy, and metals markets — derived from academic research and actively traded since 2007.
            </p>
          </Container>
        </section>

        {/* What it is */}
        <Section className="bg-lm-surface border-y border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-6">What it is</h2>
              <div className="space-y-4 text-lm-cream-muted leading-relaxed">
                <p>
                  Bayesian decision theory treats probabilities as degrees of belief that update as new evidence arrives. Rather than asking &ldquo;what pattern does this chart match,&rdquo; it asks &ldquo;given everything I know now, what is the probability that this market is in state X?&rdquo; As new price, volatility, and cross-asset data develops, those probability estimates update — producing a systematic, auditable view of market direction.
                </p>
                <p>
                  My Bayesian timing methodology is the proprietary implementation of this framework that I have developed and actively traded since 2007. It emerged from my doctoral research in financial engineering at Auburn University, where I applied Bayesian methods to real options valuation. The transition to live market timing was a natural extension: the same mathematical structure that prices optionality under uncertainty also describes how market regimes evolve.
                </p>
                <p>
                  The methodology has since been published in 12+ peer-reviewed journals and presented at international academic conferences, including a Best Presentation Award at the 18th International Conference on Business &amp; Finance in Paris (2016). It is not a black box — it is a documented, academically grounded decision process.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* How it's different */}
        <Section>
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-8">How it&apos;s different</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comparisonColumns.map((col) => (
                <div key={col.heading} className="border border-lm-border bg-lm-surface rounded-sm p-6">
                  <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-3">{col.heading}</p>
                  <p className="text-sm text-lm-cream-muted leading-relaxed">{col.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* What it trades */}
        <Section className="bg-lm-surface border-y border-lm-border">
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-8">What it trades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">For analysis</p>
                <div className="flex flex-wrap gap-2">
                  {analysisSymbols.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center font-mono text-xs text-lm-cream-muted border border-lm-border rounded-sm px-2 py-1"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">For trade signals</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {signalSymbols.map((sym) => (
                    <span
                      key={sym}
                      className="inline-flex items-center font-mono text-xs text-lm-cream-muted border border-lm-border rounded-sm px-2 py-1"
                    >
                      {sym}
                    </span>
                  ))}
                  <span className="inline-flex items-center font-mono text-xs text-lm-muted border border-lm-border rounded-sm px-2 py-1">
                    + 10+ more
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-lm-muted mt-6">
              Average hold time: several days to several months. Not a day-trading system.
            </p>
          </Container>
        </Section>

        {/* Track record & pedigree */}
        <Section>
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-8">Pedigree</h2>
              <div className="space-y-6">
                {pedigreeItems.map((item) => (
                  <div key={item.title} className="border-l-2 border-lm-border pl-5">
                    <p className="font-serif text-lm-cream mb-1">{item.title}</p>
                    <p className="text-sm text-lm-cream-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        {/* Who it's for */}
        <Section className="bg-lm-surface border-y border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-6">Who it&apos;s for</h2>
              <div className="space-y-4 text-lm-cream-muted leading-relaxed">
                <p>
                  This methodology is designed for retail traders and active investors who want a research-driven, systematic approach to timing major market moves. You don&apos;t need a math background — but you should want to understand why a signal exists, not just follow it.
                </p>
                <p>
                  It is not for passive investors. It is not for day traders. It is for people who want to take positions in major equity, energy, and metals ETFs with a defined, probability-based framework driving the decision.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section className="bg-lm-surface border-t border-lm-border">
          <Container>
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-4">Ready to follow the analysis?</h2>
              <p className="text-lm-cream-muted mb-8 max-w-xl">
                Luke&apos;s Bayesian timing analysis is published through Elliott Wave Trader. Subscribe to get access to his market calls on equity indices, energy, and metals — plus ETF trade signals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="/subscribe"
                  className="inline-flex items-center gap-2 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-8 py-3 transition-colors"
                >
                  See subscription options →
                </Link>
                <Link
                  href="/insights"
                  className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors self-center"
                >
                  Read the insights first
                </Link>
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
            { name: 'The Strategy', url: 'https://lukemillerphd.org/the-strategy' },
          ])),
        }}
      />

      <Footer />
    </>
  )
}
