// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://lukemillerphd.com',
  integrations: [
    // Keep the preview-only homepage variants out of the sitemap (they are noindex).
    sitemap({ filter: (page) => !page.includes('/variants') }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  adapter: vercel(),
});
