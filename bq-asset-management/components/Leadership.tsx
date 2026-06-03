export function Leadership() {
  return (
    <section id="about" className="py-24 lg:py-32" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <p className="eyebrow mb-12">Leadership</p>
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 lg:gap-16 p-8 lg:p-12 rounded-sm" style={{ border: '1px solid rgba(26,31,43,0.1)' }}>
          <div className="w-full rounded-sm flex items-center justify-center shrink-0" style={{ aspectRatio: '3/4', backgroundColor: '#E8E6DF' }}>
            <span className="font-serif select-none" style={{ fontSize: '48px', color: '#C8C4B8' }}>AM</span>
            {/* TODO: Replace with Alex Miller's professional headshot. */}
          </div>
          <div className="flex flex-col justify-center gap-4">
            <div>
              <h3 className="font-serif text-3xl font-medium" style={{ color: '#1A1F2B' }}>Alex Miller</h3>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] mt-1" style={{ color: '#6B7280' }}>Managing Director</p>
            </div>
            <div className="w-8 h-px" style={{ backgroundColor: '#9C7B3F' }} />
            <p className="text-base leading-relaxed" style={{ color: '#6B7280', maxWidth: '56ch' }}>
              Alex Miller leads BQ Asset Management&apos;s day-to-day client relationships and operations. He brings a background in business and aviation, with a focus on disciplined process and modern, technology-enabled client service.
            </p>
            {/* TODO: Confirm full bio, credentials, and licenses with Alex. Add Form ADV link when ready. */}
          </div>
        </div>
      </div>
    </section>
  )
}
