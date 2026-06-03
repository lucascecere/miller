const steps = [
  { num: '01', title: 'Discovery', body: "We start by understanding your full financial picture, your goals, and your concerns. No two clients have the same plan because no two clients have the same life." },
  { num: '02', title: 'Design', body: 'We build a strategy across investments, tax planning, risk management, and estate considerations. Every decision is documented and explained.' },
  { num: '03', title: 'Stewardship', body: 'We meet regularly, adjust as your life changes, and stay accessible between meetings. You will always know who is managing your money — because it will be us.' },
]

export function OurApproach() {
  return (
    <section id="approach" className="py-24 lg:py-32" style={{ backgroundColor: '#F2F1EC' }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <p className="eyebrow mb-4">Our Approach</p>
        <h2 className="font-serif leading-tight mb-16" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: '#1A1F2B' }}>A relationship, not a transaction.</h2>
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div key={step.num} className="flex gap-8 items-start py-10" style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(26,31,43,0.1)' }}>
              <span className="font-serif leading-none shrink-0 select-none w-16 text-right" style={{ fontSize: '56px', color: '#9C7B3F' }}>{step.num}</span>
              <div className="flex flex-col gap-2 pt-1">
                <h3 className="font-serif text-xl font-medium" style={{ color: '#1A1F2B' }}>{step.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
