import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { PostMeta } from '@/types/post'

export function RecentResearch({ posts }: { posts: PostMeta[] }) {
  return (
    <Section className="bg-lm-bg border-y border-lm-border">
      <Container>
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl text-lm-cream leading-tight">Recent Insights</h2>
          <Link href="/insights" className="text-sm text-lm-accent hover:text-lm-accent/80 transition-colors">
            All posts →
          </Link>
        </div>
        <ul className="flex flex-col divide-y divide-lm-border">
          {posts.map((post) => (
            <li key={post.slug} className="py-6 first:pt-0 last:pb-0">
              <Link href={`/insights/${post.slug}`} className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                <time
                  dateTime={post.date}
                  className="font-mono text-xs text-lm-muted flex-shrink-0 w-28"
                >
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <span className="font-serif text-lg text-lm-cream-muted group-hover:text-lm-cream transition-colors leading-snug">
                  {post.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
