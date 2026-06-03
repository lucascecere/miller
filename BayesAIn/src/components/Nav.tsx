'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { ArchLogo } from '@/components/ui/ArchLogo'
import { NewsletterSignup } from '@/components/ui/NewsletterSignup'

const navLinks = [
  { label: 'About',        href: '/about' },
  { label: 'The Strategy', href: '/the-strategy' },
  { label: 'Insights',     href: '/insights' },
  { label: 'Research',     href: '/research' },
  { label: 'Contact',      href: '/contact' },
]

// TODO: replace PLACEHOLDER_YOUTUBE_HANDLE with Luke's actual YouTube channel handle
const YOUTUBE_URL = 'https://www.youtube.com/@[PLACEHOLDER_YOUTUBE_HANDLE]'

export function Nav() {
  const [menuOpen,        setMenuOpen]        = useState(false)
  const [newsletterOpen,  setNewsletterOpen]  = useState(false)
  const [barDismissed,    setBarDismissed]    = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Sticky wrapper: announcement bar + nav bar together */}
      <div className="sticky top-0 z-50">

        {/* Announcement bar — dismissible for the session */}
        {!barDismissed && (
          <div className="bg-lm-surface/90 backdrop-blur-sm border-b border-lm-border py-2 px-4 flex items-center justify-center gap-2 relative">
            <button
              onClick={() => setNewsletterOpen(true)}
              className="text-xs text-lm-cream-muted hover:text-lm-cream transition-colors flex items-center gap-2 group"
            >
              <span>Get Luke&apos;s Bayesian market analysis in your inbox</span>
              <span className="text-lm-cyan group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
            <button
              onClick={() => setBarDismissed(true)}
              aria-label="Dismiss announcement"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lm-muted hover:text-lm-cream transition-colors p-1"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Main nav */}
        <nav className="bg-lm-bg/95 backdrop-blur-sm border-b border-lm-border" aria-label="Main navigation">
          <Container>
            <div className="flex items-center justify-between h-16">

              {/* Wordmark */}
              <Link href="/" className="flex items-center gap-2 text-lm-cream hover:text-lm-cream transition-colors">
                <ArchLogo className="flex-shrink-0" size={26} />
                <span className="font-serif text-lg">Luke Miller, PhD</span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`font-sans text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lm-cream/50 ${
                        isActive ? 'text-lm-cream' : 'text-lm-cream-muted hover:text-lm-cream'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>

              {/* Twitter/X — desktop */}
              {/* TODO: replace PLACEHOLDER_TWITTER_HANDLE with Luke's actual handle */}
              <a
                href="https://twitter.com/[PLACEHOLDER_TWITTER_HANDLE]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Luke Miller on X (Twitter)"
                className="hidden md:inline-flex items-center text-lm-cream-muted hover:text-lm-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lm-cream/50 rounded-sm p-1"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* YouTube — desktop */}
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Luke Miller PhD on YouTube"
                className="hidden md:inline-flex items-center text-lm-cream-muted hover:text-lm-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lm-cream/50 rounded-sm p-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Mobile hamburger */}
              <button
                className="md:hidden text-lm-cream-muted hover:text-lm-cream transition-colors p-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lm-cream/50"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </Container>

          {/* Mobile dropdown */}
          <div
            id="mobile-menu"
            aria-hidden={!menuOpen}
            className={`md:hidden bg-lm-bg border-b border-lm-border${menuOpen ? '' : ' hidden'}`}
          >
            <div className="py-4 px-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-sans text-sm py-2 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lm-cream/50 ${
                      isActive ? 'text-lm-cream' : 'text-lm-cream-muted hover:text-lm-cream'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {/* Twitter/X — mobile */}
              <a
                href="https://twitter.com/[PLACEHOLDER_TWITTER_HANDLE]"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Luke Miller on X (Twitter)"
                className="font-sans text-sm py-2 text-lm-cream-muted hover:text-lm-cream transition-colors flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow on X
              </a>
              {/* YouTube — mobile */}
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Luke Miller PhD on YouTube"
                className="font-sans text-sm py-2 text-lm-cream-muted hover:text-lm-cream transition-colors flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
              {/* Newsletter — mobile */}
              <button
                onClick={() => { setMenuOpen(false); setNewsletterOpen(true) }}
                className="font-sans text-sm py-2 text-lm-cyan hover:text-lm-cream transition-colors text-left mt-1"
              >
                Join the newsletter →
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Newsletter modal */}
      {newsletterOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setNewsletterOpen(false)}
            aria-hidden="true"
          />
          {/* Card */}
          <div className="relative bg-lm-surface border border-lm-border rounded-sm p-8 w-full max-w-md shadow-2xl">
            <button
              onClick={() => setNewsletterOpen(false)}
              className="absolute top-4 right-4 text-lm-muted hover:text-lm-cream transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lm-cream/50"
              aria-label="Close newsletter signup"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
            <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-3">Newsletter</p>
            <h2 className="font-serif text-2xl text-lm-cream mb-2">Stay current</h2>
            <p className="text-sm text-lm-cream-muted mb-6 leading-relaxed">
              Bayesian market analysis and probabilistic frameworks, delivered to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      )}
    </>
  )
}
