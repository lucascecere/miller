const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Who We Serve', href: '#who-we-serve' },
  { label: 'Our Approach', href: '#approach' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="py-16" style={{ backgroundColor: '#1A1F2B' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <a href="/" className="inline-block">
              <span className="font-serif font-semibold text-lg tracking-wide text-white">BQ</span>
              <span className="font-sans text-xs tracking-[0.2em] uppercase ml-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Asset Management</span>
            </a>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Fee-only wealth management for individuals, families, and institutions in New Hampshire and beyond.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Navigation</p>
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-sm w-fit transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>Contact</p>
            <div className="flex flex-col gap-2.5">
              {/* TODO: Replace with confirmed contact details */}
              <a href="mailto:hello@bqassetmanagement.com" className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
                hello@bqassetmanagement.com
              </a>
              <a href="tel:+10000000000" className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                (XXX) XXX-XXXX
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              © {new Date().getFullYear()} BQ Asset Management. All rights reserved.
            </p>
            <p className="text-xs leading-relaxed max-w-xl lg:text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {/* TODO: Replace with compliance-reviewed RIA disclosure */}
              BQ Asset Management is a Registered Investment Adviser. Registration does not imply a certain level of skill or training. Past performance is not indicative of future results.
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
