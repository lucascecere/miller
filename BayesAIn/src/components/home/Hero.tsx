import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16 pb-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-lm-cream leading-tight mb-6">
              Associate Professor. Bayesian analyst. Trading the system since 07.
            </h1>
            <p className="text-lg text-lm-cream-muted leading-relaxed mb-8 max-w-lg">
              The framework maps probability distributions across key market junctures — so you know where you stand and what you&apos;re risking before a move unfolds. Published weekly through Elliott Wave Trader.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <a
                href="https://www.elliottwavetrader.net/analyst/Luke-Miller"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-8 py-3 transition-colors"
              >
                Subscribe at EWT →
              </a>
              <Link
                href="/insights"
                className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors"
              >
                Read my insights
              </Link>
            </div>
          </div>

          {/* Right: portrait */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-72 h-80 lg:w-80 lg:h-96 relative overflow-hidden rounded-sm">
              <Image
                src="/headshot.webp"
                alt="Dr. Luke Miller, PhD — Associate Professor and Bayesian Timing Analyst"
                width={400}
                height={500}
                priority={true}
                className="rounded-sm object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
