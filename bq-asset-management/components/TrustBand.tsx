const items = [
  { title: 'Fiduciary', sub: 'Always, by law' },
  { title: 'Fee-Only', sub: 'No commissions. No conflicts.' },
  { title: 'Independent', sub: 'Registered Investment Adviser' },
  { title: 'Personal', sub: 'Direct access to your advisor' },
]

export function TrustBand() {
  return (
    <section aria-label="Credentials" className="py-10 lg:py-12" style={{ backgroundColor: '#F2F1EC', borderTop: '1px solid rgba(26,31,43,0.08)', borderBottom: '1px solid rgba(26,31,43,0.08)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-1">
              <span className="font-serif font-semibold text-lg" style={{ color: '#1A1F2B' }}>{item.title}</span>
              <span className="text-sm" style={{ color: '#6B7280' }}>{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
