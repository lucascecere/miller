import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ExternalLinkIcon } from '@/components/ui/ExternalLinkIcon'
import { buildBreadcrumbSchema, buildFaqSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Subscribe',
  description:
    "Get Dr. Luke Miller's Bayesian timing analysis through Elliott Wave Trader. Two tiers: market analysis on SPX, GDX, USO, DXY, and ETF trade alerts.",
  alternates: { canonical: 'https://lukemillerphd.org/subscribe' },
  openGraph: {
    title: 'Subscribe | Luke Miller, PhD',
    description:
      "Luke Miller's Bayesian timing analysis — available through Elliott Wave Trader.",
    url: 'https://lukemillerphd.org/subscribe',
  },
}

const serviceCards = [
  {
    eyebrow: 'Core service',
    title: 'Bayesian Analysis',
    description:
      "Bayesian timing analysis applied alongside Avi Gilburt's Elliott Wave work on SPX, GDX, USO, and DXY. I post my probability-weighted market views and timing assessments as market conditions develop.",
    bullets: [
      'Real-time Bayesian timing analysis',
      'Coverage: SPX, GDX, USO, DXY',
      'Complementary to Elliott Wave methodology',
      'Published through Elliott Wave Trader platform',
    ],
    ctaText: 'Subscribe at Elliott Wave Trader',
    ctaHref: 'https://www.elliottwavetrader.net/analyst/Luke-Miller',
  },
  {
    eyebrow: 'Premium add-on',
    title: 'Bayesian ETF Alerts',
    description:
      'Trade signals for 20+ stock and commodity ETFs — both long and short — derived from the Bayesian timing methodology. Average hold times range from several days to several months.',
    bullets: [
      '20+ ETFs: SPY, QQQ, IWM, GDX, SLV, GLD, USO, XBI, XLE, SMH, and more',
      'Long and short signals',
      'Hold times: days to months',
      'Based on Bayesian timing methodology',
    ],
    ctaText: 'Get ETF Alerts',
    ctaHref: 'https://www.elliottwavetrader.net/bts-guide',
  },
]

const comparisonRows = [
  { feature: 'Market coverage', analysis: 'SPX, GDX, USO, DXY', alerts: '20+ ETFs' },
  { feature: 'Signal type', analysis: 'Timing analysis', alerts: 'Long/short trade signals' },
  { feature: 'Hold time', analysis: 'Varies', alerts: 'Days to months' },
  { feature: 'Format', analysis: 'Written commentary', alerts: 'Specific entry/exit signals' },
  { feature: 'Platform', analysis: 'Elliott Wave Trader', alerts: 'Elliott Wave Trader' },
]

const faqItems = [
  {
    q: 'What is Elliott Wave Trader?',
    a: 'Elliott Wave Trader is a market analysis platform founded by Avi Gilburt, providing technical, fundamental, and probabilistic analysis across equities, metals, energy, and currencies. Luke publishes his Bayesian timing analysis on the platform alongside the Elliott Wave team.',
  },
  {
    q: 'How do I subscribe?',
    a: 'Click either subscription link above to go to Elliott Wave Trader, create an account, and select Luke\'s service. Subscription management, billing, and access are handled entirely by EWT.',
  },
  {
    q: 'What does a subscription cost?',
    a: 'Subscription pricing is set and managed by Elliott Wave Trader. Current rates are listed on the Bayesian Analysis and Bayesian ETF Alerts pages at elliottwavetrader.net.',
  },
  {
    q: 'Is this a day trading service?',
    a: 'No. This is a position trading methodology. Average hold times range from several days to several months. It is not designed for intraday trading.',
  },
  {
    q: 'What markets does Luke cover?',
    a: 'For timing analysis: S&P 500 (SPX), Gold Miners (GDX), Oil (USO), and the Dollar Index (DXY). For ETF trade signals: 20+ equity and commodity ETFs including SPY, QQQ, IWM, GDX, SLV, GLD, USO, XBI, XLE, and SMH.',
  },
]

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: 'Home', url: 'https://lukemillerphd.org' },
  { name: 'Subscribe', url: 'https://lukemillerphd.org/subscribe' },
])

export default function SubscribePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Nav />
      <main id="main-content">
        {/* 1. Header */}
        <div className="pt-32 pb-16 border-b border-lm-border">
          <Container>
            <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">
              Elliott Wave Trader
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream leading-tight mb-4">
              Get Luke&apos;s Bayesian timing analysis
            </h1>
            <p className="text-lg text-lm-cream-muted max-w-2xl leading-relaxed">
              I publish my Bayesian timing analysis and ETF trade signals through Elliott Wave
              Trader &mdash; a professional-grade platform for market analysis. Choose the tier
              that fits how you trade.
            </p>
          </Container>
        </div>

        {/* 2. Service cards */}
        <Section>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {serviceCards.map((card) => (
                <div
                  key={card.title}
                  className="border border-lm-border bg-lm-surface rounded-sm p-8 flex flex-col"
                >
                  <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">
                    {card.eyebrow}
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-4">
                    {card.title}
                  </h2>
                  <p className="text-lm-cream-muted leading-relaxed mb-6">{card.description}</p>
                  <ul className="space-y-2 mb-6">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-lm-muted mt-0.5">·</span>
                        <span className="text-sm text-lm-cream-muted">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <a
                      href={card.ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-6 py-3 transition-colors w-full justify-center"
                    >
                      {card.ctaText}
                      <ExternalLinkIcon />
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </Container>
        </Section>

        {/* 4. What you get — comparison table */}
        <Section className="bg-lm-surface border-y border-lm-border">
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-10">
              What you get
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-lm-border">
                    <th className="text-left pb-4 text-lm-muted font-mono text-xs tracking-widest uppercase">
                      Feature
                    </th>
                    <th className="text-left pb-4 text-lm-cream font-sans font-semibold">
                      Bayesian Analysis
                    </th>
                    <th className="text-left pb-4 text-lm-cream font-sans font-semibold">
                      ETF Alerts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={i < comparisonRows.length - 1 ? 'border-b border-lm-border' : ''}
                    >
                      <td className="py-4 pr-6 text-lm-muted font-mono text-xs tracking-widest uppercase">
                        {row.feature}
                      </td>
                      <td className="py-4 pr-6 text-lm-cream-muted">{row.analysis}</td>
                      <td className="py-4 text-lm-cream-muted">{row.alerts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>

        {/* Disclosures */}
        <Section className="bg-lm-surface border-y border-lm-border">
          <Container>
            <div className="max-w-3xl">
              <p className="font-mono text-xs text-lm-muted uppercase tracking-widest mb-6">Important Disclosures</p>
              <div className="space-y-4 text-xs text-lm-muted leading-relaxed">
                <p>
                  Luke Miller is an independent analyst at Elliott Wave Trader. He is not a registered broker-dealer, registered investment adviser, or financial planner, and nothing on this site or in any subscription service constitutes personalized investment advice, a recommendation, or a solicitation to buy or sell any security.
                </p>
                <p>
                  All analysis is for educational and informational purposes only. Trading and investing involve substantial risk of loss. You should not trade or invest with money you cannot afford to lose, and you should consult a qualified financial professional before making any investment decision.
                </p>
                <p>
                  References to &ldquo;actively traded since 2007&rdquo; describe Luke&apos;s personal trading of the methodology and are not a representation of fund performance, composite returns, or hypothetical results. Past performance does not guarantee future results. Individual subscriber results will vary based on entry timing, position sizing, risk management, and market conditions.
                </p>
                <p>
                  Specific securities mentioned (SPX, GDX, USO, DXY, SPY, QQQ, IWM, SLV, GLD, XBI, XLE, SMH, and others) are referenced as examples of markets covered by the methodology and are not recommendations to buy or sell.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* 5. FAQ */}
        <Section>
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-10">
              Common questions
            </h2>
            <div className="space-y-0">
              {faqItems.map((item, i) => (
                <div
                  key={item.q}
                  className={`py-6 ${i < faqItems.length - 1 ? 'border-b border-lm-border' : ''}`}
                >
                  <p className="font-serif text-lg text-lm-cream mb-2">{item.q}</p>
                  <p className="text-sm text-lm-cream-muted leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems.map(item => ({ q: item.q, a: item.a })))) }}
      />
      <Footer />
    </>
  )
}
