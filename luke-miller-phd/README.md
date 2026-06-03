# lukemillerphd.org

Personal academic website for Luke Miller, PhD — Associate Professor of Finance, Saint Anselm College.

## Tech Stack

- **Framework**: Astro 6 (static output)
- **Styling**: Tailwind CSS v4 + @tailwindcss/typography
- **Language**: TypeScript (strict)
- **Content**: Astro content collections with glob loader (MDX)
- **Fonts**: Playfair Display + DM Sans (self-hosted via @fontsource)
- **Integrations**: @astrojs/sitemap, @astrojs/rss, @astrojs/mdx
- **Deploy**: Vercel

## Local Development

```bash
npm install
npm run dev        # starts at http://localhost:4321
npm run build      # production build -> dist/
npm run preview    # preview the production build locally
```

## Adding a Research Post

1. Create a new `.mdx` file in `src/content/research/`
2. Use the filename as the URL slug (e.g., `my-paper-title.mdx` -> `/research/my-paper-title`)
3. Add required frontmatter:

```mdx
---
title: "Your Paper Title"
date: 2024-06-01
author: "Luke Miller"
category: "Real Options"         # see categories below
tags: ["tag one", "tag two"]
summary: "One or two sentences. Max 200 characters."
draft: false                     # set true to hide from site
---

Your content here...
```

**Categories** (must be exact):
- `Real Options`
- `Bayesian Methods`
- `Option Pricing`
- `Applications`
- `Financial Engineering`

4. Run `npm run dev` to preview. The post will appear in the research archive and on the homepage (top 4 by date).

## Deployment

Connected to Vercel. Auto-deploys on push to `main`.

- **Production domain**: lukemillerphd.org (DNS pending)
- **Vercel project**: luke-miller-phd (separate from BayesAIn Strategies)
- Build command: `npm run build`
- Output directory: `dist`

## Design Tokens

| Token      | Value     | Use                             |
|------------|-----------|---------------------------------|
| Background | `#FAFAF9` | Page background                 |
| Text       | `#1C1917` | Body text                       |
| Accent     | `#4A6FA5` | Links, hover states, categories |
| Muted      | `#6B7280` | Secondary text, dates           |
| Border     | `#E5E7EB` | Dividers, card borders          |
| Surface    | `#F3F4F6` | Tag backgrounds, placeholders   |

## Important Constraints

- **No dark mode** — light-only
- **No forms** — `/contact` is `mailto:` only
- **No tracking scripts** — analytics not yet added
- **No commercial CTAs** — academic homepage framing only
- **Bayesian Math** — may appear as plain text only, no link
