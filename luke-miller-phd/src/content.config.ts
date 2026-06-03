import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const researchCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/research' }),
  schema: z.object({
    title:    z.string(),
    date:     z.coerce.date(),
    author:   z.string().default('Luke Miller'),
    category: z.enum([
      'Real Options',
      'Bayesian Methods',
      'Option Pricing',
      'Applications',
      'Financial Engineering',
    ]),
    tags:     z.array(z.string()),
    summary:  z.string().max(200),
    draft:    z.boolean().default(false),
  }),
});

export const collections = {
  research: researchCollection,
};
