import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { NewsletterSignup } from '@/components/ui/NewsletterSignup'
import { ArchLogo } from '@/components/ui/ArchLogo'

// TODO: replace PLACEHOLDER_TWITTER_HANDLE with Luke's actual handle
const TWITTER_URL = 'https://twitter.com/[PLACEHOLDER_TWITTER_HANDLE]'

// TODO: replace PLACEHOLDER_YOUTUBE_HANDLE with Luke's actual YouTube channel handle
const YOUTUBE_URL = 'https://www.youtube.com/@[PLACEHOLDER_YOUTUBE_HANDLE]'

export function Footer() {
  return (
    <footer className="bg-lm-surface border-t border-lm-border mt-auto">
      <Container>
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Site */}
          <nav aria-label="Site navigation">
            <p className="text-xs text-lm-muted uppercase tracking-widest mb-4">Site</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/about"        className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">About</Link>
              <Link href="/the-strategy" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">The Strategy</Link>
              <Link href="/insights"     className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">Insights</Link>
              <Link href="/subscribe"    className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">Subscribe</Link>
              <Link href="/contact"      className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors">Contact</Link>
            </div>
          </nav>

          {/* Col 2 — Recent Insights */}
          <nav aria-label="Recent insights">
            <p className="text-xs text-lm-muted uppercase tracking-widest mb-4">Recent Insights</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/insights/bayesian-priors-in-financial-markets" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors leading-snug">
                Bayesian Priors in Financial Markets
              </Link>
              <Link href="/insights/elliott-wave-and-bayesian-confirmation" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors leading-snug">
                Elliott Wave & Bayesian Confirmation
              </Link>
              <Link href="/insights/decision-making-under-uncertainty" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors leading-snug">
                Decision-Making Under Uncertainty
              </Link>
              <Link href="/insights/why-frequentist-thinking-fails-investors" className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors leading-snug">
                Why Frequentist Thinking Fails Investors
              </Link>
            </div>
          </nav>

          {/* Col 3 — Connect */}
          <nav aria-label="Connect with Luke Miller">
            <p className="text-xs text-lm-muted uppercase tracking-widest mb-4">Connect</p>
            <div className="flex flex-col gap-2.5">
              <a
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Follow on X
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
              <a
                href="mailto:luke@lukemillerphd.org"
                className="text-sm text-lm-cream-muted hover:text-lm-cream transition-colors"
              >
                luke@lukemillerphd.org
              </a>
            </div>
          </nav>

          {/* Col 4 — Newsletter */}
          <div>
            <p className="text-xs text-lm-muted uppercase tracking-widest mb-4">Newsletter</p>
            <p className="text-sm text-lm-muted mb-4 leading-relaxed">
              Market analysis and probabilistic frameworks, direct to your inbox.
            </p>
            <NewsletterSignup />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-lm-border py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <ArchLogo size={18} />
            <p className="text-xs text-lm-muted">© {new Date().getFullYear()} Luke Miller, PhD. All rights reserved.</p>
          </div>
          <p className="text-xs text-lm-muted">
            Built by{' '}
            <a
              href="https://yourwebsitefriend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-lm-cream-muted transition-colors"
            >
              YWF
            </a>
          </p>
        </div>
      </Container>
    </footer>
  )
}
