const cards = [
  { title: 'Individuals & Families', body: 'Comprehensive wealth management for high-net-worth individuals and multi-generational families navigating wealth transfer, tax strategy, and long-term planning.' },
  { title: 'Institutions', body: 'Investment advisory and consulting for foundations, endowments, and corporate retirement plans.' },
  { title: 'Business Owners', body: 'Specialized planning for entrepreneurs and business owners managing concentrated positions, liquidity events, and succession.' },
]

export function WhoWeServe() {
  return (
    <section id="who-we-serve" className="py-24 lg:py-32" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="eyebrow mb-4">Who We Serve</p>
        <h2 className="font-serif leading-tight mb-14 max-w-xl" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1F2B' }}>Built for complexity. Focused on you.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.title} className="flex flex-col gap-4 p-8 rounded-sm" style={{ border: '1px solid rgba(26,31,43,0.1)' }}>
              <div className="w-8 h-px" style={{ backgroundColor: '#9C7B3F' }} />
              <h3 className="font-serif text-xl font-medium" style={{ color: '#1A1F2B' }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
