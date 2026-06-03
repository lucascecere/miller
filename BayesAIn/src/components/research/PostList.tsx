import Link from 'next/link'
import type { PostMeta } from '@/types/post'

export function PostList({ post }: { post: PostMeta }) {
  return (
    <li className="py-8 first:pt-0 last:pb-0 border-b border-lm-border last:border-b-0">
      <Link href={`/insights/${post.slug}`} className="group block">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 mb-3">
          <time
            dateTime={post.date}
            className="font-mono text-xs text-lm-muted flex-shrink-0"
          >
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <h2 className="font-serif text-xl sm:text-2xl text-lm-cream group-hover:text-lm-cream transition-colors leading-snug">
            {post.title}
          </h2>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            {post.tags.map((tag) => (
              <span key={tag} className="font-mono text-xs text-lm-muted border border-lm-border rounded-sm px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-lm-cream-muted leading-relaxed mb-4 mt-2">
          {post.excerpt}
        </p>
        <span className="text-sm text-lm-cream-muted group-hover:text-lm-cream transition-colors">
          Read →
        </span>
      </Link>
    </li>
  )
}
