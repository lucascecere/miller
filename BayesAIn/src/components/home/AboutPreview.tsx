import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function AboutPreview() {
  return (
    <Section className="bg-lm-surface border-y border-lm-border">
      <Container>
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-6">The Methodology</p>
          <p className="text-xl text-lm-cream-muted leading-relaxed mb-8">
            My Bayesian timing methodology applies Bayesian decision theory to market timing — systematically updating probability estimates as price, volatility, and cross-asset data evolve. The result is a systematic approach to timing major moves in equity indices, energy, and metals, with a decision process grounded in peer-reviewed academic research.
          </p>
          <Link
            href="/the-strategy"
            className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors inline-flex items-center gap-2"
          >
            Learn about the methodology →
          </Link>
        </div>
      </Container>
    </Section>
  )
}
