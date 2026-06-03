import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ContactForm } from '@/components/contact/ContactForm'
import { buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Dr. Luke Miller for consulting inquiries, media and speaking requests, or questions about the Bayesian timing subscription.',
  alternates: { canonical: 'https://lukemillerphd.org/contact' },
  openGraph: {
    title: 'Contact | Luke Miller, PhD',
    description: 'Get in touch with Dr. Luke Miller for consulting inquiries, media and speaking requests, or questions about the Bayesian timing subscription.',
    url: 'https://lukemillerphd.org/contact',
  },
}

const contactPaths = [
  {
    label: 'Consulting inquiries',
    value: 'luke@lukemillerphd.org',
    href: 'mailto:luke@lukemillerphd.org',
  },
  {
    label: 'Media & speaking',
    value: 'luke@lukemillerphd.org',
    href: 'mailto:luke@lukemillerphd.org',
  },
]

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <section className="pt-32 pb-16 border-b border-lm-border">
          <Container>
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream mb-4">Get in touch</h1>
              <p className="text-lg text-lm-cream-muted">
                Choose the right channel below, or use the form and I will route your message accordingly.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact paths */}
        <Section>
          <Container>
            <div className="max-w-2xl space-y-6 mb-16">
              {contactPaths.map((path) => (
                <div
                  key={path.label}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-4 border-b border-lm-border last:border-b-0"
                >
                  <span className="font-mono text-xs text-lm-muted tracking-widest uppercase w-40 flex-shrink-0">
                    {path.label}
                  </span>
                  <a
                    href={path.href}
                    className="text-sm text-lm-accent hover:text-lm-accent/80 transition-colors"
                  >
                    {path.value}
                  </a>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-lm-cream leading-tight mb-6">Or send a message</h2>
              <ContactForm />
            </div>
          </Container>
        </Section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema([
            { name: 'Home', url: 'https://lukemillerphd.org' },
            { name: 'Contact', url: 'https://lukemillerphd.org/contact' },
          ])),
        }}
      />
      <Footer />
    </>
  )
}
