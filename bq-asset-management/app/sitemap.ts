import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://bayesainstrategies.com', // TODO: Update to confirmed domain before launch
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
  // TODO: Update domain from placeholder once confirmed
}
