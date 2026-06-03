export function CTASection() {
  return (
    <section id="contact" className="py-24 lg:py-32" style={{ backgroundColor: '#1E3A5F' }}>
      <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
        <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: '#9C7B3F' }} />
        <h2 className="font-serif leading-tight mb-6 text-white" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>Ready to start a conversation?</h2>
        <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
          If you&apos;d like to talk about whether BQ is the right fit for your situation, we&apos;d be glad to start a conversation.
        </p>
        {/* TODO: Replace mailto with confirmed contact email */}
        <a href="mailto:hello@bqassetmanagement.com" className="inline-flex items-center justify-center text-sm font-semibold tracking-wide rounded-sm px-10 py-4 transition-colors" style={{ backgroundColor: '#FAFAF7', color: '#1E3A5F' }}>
          Schedule a Consultation
        </a>
        <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {/* TODO: Add real phone number once confirmed by Alex Miller */}
          Or call us at{' '}<a href="tel:+10000000000" style={{ color: 'rgba(255,255,255,0.6)' }}>(XXX) XXX-XXXX</a>
        </p>
      </div>
    </section>
  )
}
