import type { Metadata } from 'next'

export const BASE_URL = 'https://lukemillerphd.org'

export function buildMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const defaults: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: 'Luke Miller, PhD — Bayesian Decision Systems',
    description:
      'Associate Professor of Economics & Business at Saint Anselm College. Bayesian timing analyst applying a probabilistic framework to equity, energy, and metals markets since 2007.',
  }

  return {
    ...defaults,
    ...overrides,
    openGraph: {
      ...defaults.openGraph,
      ...(overrides.openGraph ?? {}),
    },
  }
}

export const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Luke Miller',
  honorificSuffix: 'PhD',
  jobTitle: 'Associate Professor of Economics & Business and Bayesian Timing Analyst',
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'Saint Anselm College',
  },
  url: 'https://lukemillerphd.org',
  sameAs: [],
}

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Luke Miller, PhD',
  url: 'https://lukemillerphd.org',
}

export const PROFESSIONAL_SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Luke Miller, PhD — Consulting',
  description:
    'Bayesian decision frameworks applied to complex strategic and operational problems.',
  url: 'https://lukemillerphd.org/consulting',
  areaServed: 'Worldwide',
  knowsAbout: [
    'Bayesian decision systems',
    'probabilistic modeling',
    'quantitative strategy',
    'financial engineering',
  ],
}

export function buildBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function buildArticleSchema(post: { title: string; date: string; excerpt: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Luke Miller',
      honorificSuffix: 'PhD',
      url: 'https://lukemillerphd.org',
    },
    url: `https://lukemillerphd.org/insights/${post.slug}`,
    publisher: {
      '@type': 'Person',
      name: 'Luke Miller, PhD',
      url: 'https://lukemillerphd.org',
    },
  }
}

export function buildFaqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What types of organizations does Dr. Luke Miller consult with?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dr. Miller works with financial services firms, technology companies, energy and infrastructure organizations, healthcare and insurance providers, and mission-driven nonprofits, applying Bayesian probabilistic frameworks to strategic decision-making.',
      },
    },
    {
      '@type': 'Question',
      name: "What is Dr. Miller's consulting methodology?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dr. Miller applies Bayesian probabilistic frameworks grounded in financial engineering research to help organizations navigate uncertainty, evaluate strategic risk, and improve decision quality. Engagements span quantitative modeling, AI/ML integration, executive education, and custom methodology design.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I engage Dr. Luke Miller for consulting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Consulting inquiries can be sent directly to luke@lukemillerphd.org or submitted via the contact page at lukemillerphd.org/contact. Dr. Miller takes a limited number of engagements per year to ensure quality and depth of work.',
      },
    },
    {
      '@type': 'Question',
      name: "What is the Bayesian timing methodology and how does it relate to Dr. Miller's consulting work?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Dr. Miller's Bayesian timing methodology is a paid market analysis program published through Elliott Wave Trader that applies Bayesian decision theory to equity indices, energy, and metals markets. It is a separate offering from his institutional consulting work, which focuses on organizational decision systems and strategic risk frameworks.",
      },
    },
  ],
}
