import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Container } from '@/components/ui/Container'
import { ProseLayout } from '@/components/ui/ProseLayout'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { buildBreadcrumbSchema, buildArticleSchema } from '@/lib/seo'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `https://lukemillerphd.org/insights/${slug}` },
    openGraph: {
      title: `${post.title} | Luke Miller, PhD`,
      description: post.excerpt,
      url: `https://lukemillerphd.org/insights/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function InsightsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const articleSchema = buildArticleSchema(post)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://lukemillerphd.org' },
    { name: 'Insights', url: 'https://lukemillerphd.org/insights' },
    { name: post.title, url: `https://lukemillerphd.org/insights/${post.slug}` },
  ])

  return (
    <>
      <Nav />
      <main id="main-content" className="pt-24 pb-16">
        <Container>
          <ProseLayout>
            <article>
              <header className="mb-12 not-prose">
                <div className="flex items-center gap-4 mb-6">
                  <time
                    dateTime={post.date}
                    className="font-mono text-xs text-lm-muted"
                  >
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="text-lm-border" aria-hidden="true">·</span>
                  <span className="font-mono text-xs text-lm-muted">
                    {post.readingTime} min read
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-lm-cream leading-tight">
                  {post.title}
                </h1>
              </header>

              <MDXRemote source={post.content} />

              <footer className="mt-16 pt-8 border-t border-lm-border not-prose space-y-6">
                <Link href="/insights" className="text-sm text-lm-accent hover:text-lm-accent/80 transition-colors block">
                  ← Back to Insights
                </Link>
                {/* EWT subscription CTA */}
                <div className="mt-8 p-6 border border-lm-border bg-lm-surface rounded-sm">
                  <p className="font-mono text-xs text-lm-muted tracking-widest uppercase mb-3">Want Luke&apos;s live market calls?</p>
                  <p className="font-serif text-lm-cream text-lg leading-snug mb-4">
                    Get Bayesian timing analysis on equity indices, energy, and metals at Elliott Wave Trader.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://www.elliottwavetrader.net/analyst/Luke-Miller"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-6 py-2.5 transition-colors"
                    >
                      Subscribe at EWT →
                    </a>
                    <a
                      href="https://www.elliottwavetrader.net/bts-guide"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 border border-lm-border text-lm-cream-muted hover:border-lm-cream/30 hover:text-lm-cream font-sans text-sm tracking-wide rounded-sm px-6 py-2.5 transition-colors"
                    >
                      ETF Trade Alerts →
                    </a>
                  </div>
                </div>
              </footer>
            </article>
          </ProseLayout>
        </Container>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Footer />
    </>
  )
}
