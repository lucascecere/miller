import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Finance professor and Bayesian timing analyst at Saint Anselm College. Gilbreth Memorial Fellowship recipient. Applying a probabilistic framework to markets since 2007.',
  alternates: { canonical: 'https://lukemillerphd.org/about' },
  openGraph: {
    title: 'About Dr. Luke Miller, PhD',
    description: 'Finance professor and Bayesian timing analyst. Applies a proprietary probabilistic framework to time equity, energy, and metals markets. Actively traded since 2007.',
    url: 'https://lukemillerphd.org/about',
  },
}

const credentials = [
  {
    label: 'Education',
    items: [
      'BS Systems Engineering — University of Virginia',
      'MS Financial Engineering — Auburn University',
      'PhD Financial Engineering — Auburn University',
      'Gilbreth Memorial Fellowship (top doctoral student nationally)',
    ],
  },
  {
    label: 'Service',
    items: [
      'U.S. Air Force Officer',
      'Associate Professor of Economics & Business',
      'Saint Anselm College, Manchester, NH',
    ],
  },
  {
    label: 'Recognition',
    items: [
      'Best Presentation Award — 18th International Conference on Business & Finance, Paris (2016)',
      '12+ peer-reviewed publications',
      'Developer, Bayesian timing methodology',
    ],
  },
]

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        {/* Header */}
        <section className="pt-32 pb-16 border-b border-lm-border">
          <Container>
            <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">
              Associate Professor · Researcher · Bayesian Timing Analyst
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream">About Dr. Luke Miller</h1>
          </Container>
        </section>

        {/* Bio + Headshot */}
        <Section>
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
              {/* Headshot */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-64 h-80 relative rounded-sm overflow-hidden flex-shrink-0">
                  <Image
                    src="/headshot.webp"
                    alt="Dr. Luke Miller, PhD — Associate Professor and Bayesian Timing Analyst"
                    width={256}
                    height={320}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="lg:col-span-2 space-y-5 text-lm-cream-muted leading-relaxed">
                <p>
                  Dr. Luke Miller is a finance professor and Bayesian timing analyst. He applies a proprietary probabilistic framework — grounded in Bayesian decision theory — to time major moves in equity indices, energy, and metals markets. His work bridges peer-reviewed academic research with active trading he has done in live markets since 2007.
                </p>
                <p>
                  He holds a Bachelor of Science in Systems Engineering from the University of Virginia. Upon graduation he served as an officer in the United States Air Force. He earned both a Master of Science and a Ph.D. in Financial Engineering from Auburn University, where he was awarded the Gilbreth Memorial Fellowship — given to the nation&apos;s top doctoral student in industrial and systems engineering.
                </p>
                <p>
                  Dr. Miller currently serves as Associate Professor of Economics &amp; Business at Saint Anselm College in Manchester, New Hampshire. He has developed and actively traded a Bayesian timing methodology since 2007, offering timing analysis on equity indices, energy, and metals markets through Elliott Wave Trader. His research has appeared in 12+ peer-reviewed journals and has been recognized internationally, including the Best Presentation Award at the 18th International Conference on Business &amp; Finance in Paris (2016).
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* Credentials strip */}
        <Section className="bg-lm-surface border-y border-lm-border">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {credentials.map((group) => (
                <div key={group.label}>
                  <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">{group.label}</p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-lm-cream-muted leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* The Methodology's Origins */}
        <Section className="border-t border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">The Methodology</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-6">The Methodology&apos;s Origins</h2>
              <div className="space-y-4 text-lm-cream-muted leading-relaxed">
                <p>My Bayesian timing methodology emerged from my doctoral research in financial engineering at Auburn University, where I developed frameworks for applying Bayesian decision theory to real options valuation. The core insight — that probability estimates should update systematically as evidence accumulates, rather than being fixed at the outset — proved equally powerful in financial markets.</p>
                <p>I began actively trading the system in 2007, which meant testing it through the 2008 financial crisis, the 2010 flash crash, the COVID collapse of 2020, and every cycle in between. That live track record, alongside the academic foundation, gives me confidence in what the methodology can and cannot do.</p>
                <p>Today, the methodology covers Bayesian timing analysis on SPX, GDX, USO, and DXY for analysis, with trade signals on 20+ stock and commodity ETFs — both long and short, with average hold times ranging from several days to several months. The analysis is published through Elliott Wave Trader, where I work alongside Avi Gilburt&apos;s Elliott Wave analysis to provide a complementary Bayesian perspective.</p>
              </div>
            </div>
          </Container>
        </Section>

        {/* Speaking & Recognition */}
        <Section className="border-t border-lm-border bg-lm-surface">
          <Container>
            <div className="max-w-2xl">
              <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">Recognition</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-8">Speaking &amp; Awards</h2>
              <div className="space-y-6">
                <div className="border-l-2 border-lm-border pl-5">
                  <p className="font-serif text-lm-cream mb-1">Best Presentation Award</p>
                  <p className="text-sm text-lm-cream-muted">18th International Conference on Business &amp; Finance, Paris, France (2016)</p>
                </div>
                <div className="border-l-2 border-lm-border pl-5">
                  <p className="font-serif text-lm-cream mb-1">Gilbreth Memorial Fellowship</p>
                  <p className="text-sm text-lm-cream-muted">Awarded to the nation&apos;s top doctoral student in industrial and systems engineering (2003)</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section>
          <Container>
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-3">Get my analysis</h2>
              <p className="text-lm-cream-muted mb-6">Follow my Bayesian timing work on equity indices, energy, and metals through Elliott Wave Trader.</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link href="/subscribe" className="inline-flex items-center gap-2 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-8 py-3 transition-colors">
                  See subscription options →
                </Link>
                <Link href="/the-strategy" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors self-center">
                  Learn about the methodology
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
            { name: 'About', url: 'https://lukemillerphd.org/about' },
          ])),
        }}
      />
      <Footer />
    </>
  )
}
