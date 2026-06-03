import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { PostMeta, PostWithContent } from '@/types/post'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

function computeReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / 200)
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'))

  const posts: PostMeta[] = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '')
    const filePath = path.join(POSTS_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      excerpt: data.excerpt as string,
      readingTime: computeReadingTime(content),
      tags: data.tags ?? [],
    }
  })

  // Sort newest-first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): PostWithContent | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
    readingTime: computeReadingTime(content),
    content,
  }
}

export function getRecentPosts(n: number): PostMeta[] {
  return getAllPosts().slice(0, n)
}
