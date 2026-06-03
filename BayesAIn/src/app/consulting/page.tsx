import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { EngagementList } from '@/components/consulting/EngagementList'
import { PublicationsList } from '@/components/consulting/PublicationsList'
import { buildBreadcrumbSchema, FAQ_SCHEMA } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Consulting',
  description:
    'Dr. Luke Miller applies Bayesian decision frameworks to strategic and operational problems across financial services, technology, energy, and healthcare.',
  alternates: { canonical: 'https://lukemillerphd.org/consulting' },
  openGraph: {
    title: 'Consulting | Luke Miller, PhD',
    description:
      'Bayesian decision frameworks applied to complex strategic and operational problems across financial services, technology, energy, and healthcare.',
    url: 'https://lukemillerphd.org/consulting',
  },
}

const focusAreas = [
  'Probabilistic decision frameworks',
  'Risk and uncertainty modeling',
  'Quantitative strategy and methodology design',
  'AI/ML integration for decision systems',
  'Executive education and advisory',
]

export default function ConsultingPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        {/* Header */}
        <section className="pt-32 pb-16 border-b border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream mb-6">Consulting</h1>
              <p className="text-lg text-lm-cream-muted leading-relaxed">
                Dr. Miller&apos;s consulting work applies Bayesian decision frameworks to complex strategic
                and operational problems. Engagements span financial services, technology, energy,
                healthcare, and mission-driven organizations.
              </p>
            </div>
          </Container>
        </section>

        {/* Areas of focus */}
        <Section>
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-8">Areas of Focus</h2>
              <ul className="space-y-3">
                {focusAreas.map((area) => (
                  <li key={area} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-lm-muted flex-shrink-0" aria-hidden="true" />
                    <span className="text-lm-cream-muted leading-relaxed">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>

        {/* Selected engagements */}
        <Section className="border-t border-lm-border bg-lm-surface">
          <Container>
            <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-10">Selected Engagements</h2>
            <EngagementList />
          </Container>
        </Section>

        {/* Research & Publications */}
        <Section className="border-t border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-8">Research &amp; Publications</h2>
              <PublicationsList />
            </div>
          </Container>
        </Section>

        {/* Full bio */}
        <Section className="border-t border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight mb-6">About Dr. Miller</h2>
              <div className="space-y-4 text-lm-cream-muted leading-relaxed">
                <p>
                  Dr. Luke Miller is a finance professor and Bayesian timing analyst. He applies a
                  proprietary probabilistic framework — grounded in Bayesian decision theory — to
                  help organizations navigate uncertainty, evaluate strategic risk, and improve
                  decision quality.
                </p>
                <p>
                  He holds an undergraduate degree in Systems Engineering from the University of
                  Virginia, where upon completion, he proudly served as an officer in the U.S. Air
                  Force. He earned both a Master&apos;s and Ph.D. in Financial Engineering from Auburn
                  University, receiving the Gilbreth Memorial Fellowship — awarded to the nation&apos;s
                  top doctoral student.
                </p>
                <p>
                  Dr. Miller currently serves as an Associate Professor of Economics &amp; Business at
                  Saint Anselm College in New Hampshire. He has developed and actively traded a
                  Bayesian timing methodology since 2007, providing timing analysis on equity
                  indices, energy, and metals markets through Elliott Wave Trader. His research has
                  been recognized at international conferences, including the Best Presentation Award
                  at the 18th International Conference on Business &amp; Finance in Paris (2016), and he
                  has published over a dozen peer-reviewed journal articles.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <section className="border-t border-lm-border bg-lm-surface py-16">
          <Container>
            <h2 className="font-serif text-xl sm:text-2xl text-lm-cream leading-tight mb-3">Start a Conversation</h2>
            <p className="text-lm-cream-muted mb-6 max-w-xl">
              For consulting inquiries, please reach out directly or visit the contact page.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="inline-flex items-center gap-1.5 border border-lm-accent text-lm-accent hover:bg-lm-accent hover:text-white font-sans font-bold text-sm tracking-wide rounded-sm px-6 py-2.5 transition-colors">
                Contact page →
              </Link>
              <Link href="/subscribe" className="inline-flex items-center gap-1.5 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-6 py-2.5 transition-colors">
                Subscribe at EWT →
              </Link>
            </div>
          </Container>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema([
            { name: 'Home', url: 'https://lukemillerphd.org' },
            { name: 'Consulting', url: 'https://lukemillerphd.org/consulting' },
          ])),
        }}
      />
      <Footer />
    </>
  )
}
