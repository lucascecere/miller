import React from 'react'
import { Container } from '@/components/ui/Container'

const statuses: React.ReactNode[] = [
  'Teaching finance at Saint Anselm College',
  'Publishing Bayesian timing analysis at Elliott Wave Trader',
  'Available for select consulting engagements',
]

export function CurrentlyBand() {
  return (
    <section className="border-y border-lm-border bg-lm-surface py-8">
      {/* Mobile: auto-scrolling marquee */}
      <div className="md:hidden relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee-fast flex items-center gap-12 whitespace-nowrap">
          {[...statuses, ...statuses].map((status, i) => (
            <div key={i} className="flex items-center gap-3 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-lm-muted flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-lm-cream-muted">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 3-column divided layout */}
      <Container className="hidden md:block">
        <div className="flex divide-x divide-lm-border">
          {statuses.map((status, i) => (
            <div key={i} className="px-8 first:pl-0 last:pr-0 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-lm-muted flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-lm-cream-muted">{status}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
