import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const postRoutes = posts.map((post) => ({
    url: `https://lukemillerphd.org/insights/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: 'https://lukemillerphd.org', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://lukemillerphd.org/research', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: 'https://lukemillerphd.org/insights', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: 'https://lukemillerphd.org/about', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: 'https://lukemillerphd.org/consulting', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: 'https://lukemillerphd.org/contact', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: 'https://lukemillerphd.org/the-strategy', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: 'https://lukemillerphd.org/subscribe', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.6 },
    ...postRoutes,
  ]
}
