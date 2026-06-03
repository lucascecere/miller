export type PostMeta = {
  slug: string
  title: string
  date: string       // ISO date string
  excerpt: string
  readingTime: number // minutes, computed from word count
  tags?: string[]
}

export type PostWithContent = PostMeta & {
  content: string    // raw MDX string passed to MDXRemote
}
