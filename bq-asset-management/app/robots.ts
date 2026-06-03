import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://bayesainstrategies.com/sitemap.xml', // TODO: Update to confirmed domain before launch
  }
  // TODO: Update domain from placeholder once confirmed
}
