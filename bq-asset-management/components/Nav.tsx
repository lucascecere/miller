'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#who-we-serve' },
  { label: 'Approach', href: '#approach' },
  { label: 'Contact', href: '#contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: '#FAFAF7',
          borderBottom: scrolled ? '1px solid rgba(26,31,43,0.1)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Wordmark */}
            <a href="/" className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl tracking-widest" style={{ color: '#1A1F2B' }}>
                BQ
              </span>
              <span className="hidden sm:inline text-xs font-medium tracking-[0.22em] uppercase" style={{ color: '#6B7280' }}>
                ASSET MANAGEMENT
              </span>
              {/* TODO: Replace text wordmark with final logo SVG once delivered */}
            </a>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-bq-text"
                  style={{ color: '#6B7280' }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <a
              href="#contact"
              className="hidden md:inline-flex items-center text-sm font-semibold tracking-wide rounded-sm px-5 py-2.5 text-white transition-colors whitespace-nowrap"
              style={{ backgroundColor: '#1E3A5F' }}
            >
              Schedule a Consultation
            </a>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{ color: '#1A1F2B' }}
            >
              <Menu size={22} />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col px-8 pt-8 pb-12"
          style={{ backgroundColor: '#FAFAF7' }}
        >
          <div className="flex items-center justify-between mb-10">
            <span className="font-serif font-bold text-xl tracking-widest" style={{ color: '#1A1F2B' }}>BQ</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ color: '#1A1F2B' }}>
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-2xl py-5"
                style={{ color: '#1A1F2B', borderBottom: '1px solid rgba(26,31,43,0.1)' }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-auto inline-flex items-center justify-center text-sm font-semibold tracking-wide rounded-sm px-5 py-4 text-white"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            Schedule a Consultation
          </a>
        </div>
      )}
    </>
  )
}
