import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { PostList } from '@/components/research/PostList'
import { getAllPosts } from '@/lib/posts'
import { buildBreadcrumbSchema } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Insights',
  description:
    'Market commentary and notes on Bayesian thinking and probabilistic decision-making from Dr. Luke Miller, PhD. Free to read, published regularly.',
  alternates: { canonical: 'https://lukemillerphd.org/insights' },
  openGraph: {
    title: 'Insights | Luke Miller, PhD',
    description: 'Market commentary, Bayesian thinking, and notes from Dr. Luke Miller, PhD.',
    url: 'https://lukemillerphd.org/insights',
  },
}

export default function InsightsPage() {
  const posts = getAllPosts()
  return (
    <>
      <Nav />
      <main id="main-content" className="pt-32 pb-24">
        <Container>
          <header className="mb-16 max-w-2xl">
            <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-4">Insights</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-lm-cream leading-tight mb-4">
              Market commentary and notes
            </h1>
            <p className="text-lg text-lm-cream-muted max-w-2xl">Notes on Bayesian thinking, market analysis, and probabilistic decision-making. Subscribe at Elliott Wave Trader for Luke&apos;s live market calls.</p>
            <a href="/insights/rss.xml" className="font-mono text-xs text-lm-muted hover:text-lm-cream-muted transition-colors inline-flex items-center gap-1 mt-4">
              RSS feed
            </a>
          </header>
          <ul className="max-w-2xl">
            {posts.map((post) => (
              <PostList key={post.slug} post={post} />
            ))}
          </ul>
        </Container>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbSchema([
            { name: 'Home', url: 'https://lukemillerphd.org' },
            { name: 'Insights', url: 'https://lukemillerphd.org/insights' },
          ])),
        }}
      />
      <Footer />
    </>
  )
}
