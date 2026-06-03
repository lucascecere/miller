import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

const tiles = [
  {
    eyebrow: 'Subscribe',
    label: 'Follow the markets with me',
    description: 'Get Bayesian timing analysis on equity indices, energy, and metals — delivered through Elliott Wave Trader.',
    href: '/subscribe',
  },
  {
    eyebrow: 'Insights',
    label: 'Read my latest insights',
    description: 'Market commentary, Bayesian thinking, and notes on probability and decision-making.',
    href: '/insights',
  },
  {
    eyebrow: 'Research',
    label: 'Explore my academic work',
    description: '12+ peer-reviewed publications and a career of research in financial engineering and Bayesian systems.',
    href: '/research',
  },
]

export function SelectedWork() {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group block border border-lm-border bg-lm-surface rounded-sm p-6 hover:border-lm-violet/50 transition-colors"
            >
              <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-3">{tile.eyebrow}</p>
              <h3 className="font-serif text-lg text-lm-cream group-hover:text-lm-cream transition-colors mb-3">{tile.label}</h3>
              <p className="text-sm text-lm-muted leading-relaxed">{tile.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}
