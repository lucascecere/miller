import { Container } from '@/components/ui/Container'

const credentials = [
  {
    label: 'Academic',
    value: 'Associate Professor of Economics & Business',
    sub: 'Saint Anselm College, Manchester, NH',
  },
  {
    label: 'Fellowship',
    value: 'Gilbreth Memorial Fellowship (2003)',
    sub: 'Top PhD student in the nation',
  },
  {
    label: 'Recognition',
    value: 'Best Presentation Award',
    sub: "18th Int'l Conference on Business & Finance, Paris (2016)",
  },
  {
    label: 'Market Analyst',
    value: 'Elliott Wave Trader',
    sub: 'Bayesian timing analysis since 2007',
  },
]

export function LogoBand() {
  return (
    <div className="bg-lm-surface border-y border-lm-border py-10 overflow-hidden">

      {/* Mobile: marquee */}
      <div className="md:hidden">
        <div className="flex animate-marquee-fast whitespace-nowrap">
          {[...credentials, ...credentials].map((cred, i) => (
            <div key={i} className="flex-shrink-0 flex items-center">
              <div className="px-8">
                <span className="text-sm text-lm-cream">{cred.value}</span>
                <span className="text-xs text-lm-muted ml-2">{cred.sub}</span>
              </div>
              <span className="text-lm-border text-lg select-none">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 4-col grid */}
      <div className="hidden md:block">
        <Container>
          <div className="grid grid-cols-4 gap-6">
            {credentials.map((cred) => (
              <div key={cred.label}>
                <p className="text-sm text-lm-cream leading-snug mb-0.5">{cred.value}</p>
                <p className="text-xs text-lm-muted leading-relaxed">{cred.sub}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

    </div>
  )
}
