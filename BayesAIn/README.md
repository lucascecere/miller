# lukemillerphd.org

Personal and professional website for Dr. Luke Miller, PhD — Associate Professor of Economics & Business at Saint Anselm College, and Bayesian timing analyst at Elliott Wave Trader. Home of BayesAIn Strategies.

Built by [YWF](https://yourwebsitefriend.com).

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Styling:** Tailwind CSS v4 (CSS-based config, `lm-*` design tokens)
- **Content:** MDX via `next-mdx-remote`, posts in `/content/posts/`
- **Email:** Resend (contact form + newsletter)
- **Analytics:** Vercel Analytics
- **Fonts:** Playfair Display (serif) + Inter (sans) + JetBrains Mono via `next/font`
- **Deployment:** Vercel

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/about` | Bio, credentials, BayesAIn journey |
| `/the-strategy` | BayesAIn Strategies methodology explainer |
| `/insights` | Blog — market commentary and notes |
| `/insights/[slug]` | Individual post |
| `/insights/rss.xml` | RSS feed |
| `/research` | Academic publications, book, conferences |
| `/subscribe` | EWT subscription page (conversion) |
| `/contact` | Contact form (Resend-wired) |

## Local Development

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy env vars: `cp .env.example .env.local` and fill in values
4. Run dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key — get one at resend.com |
| `CONTACT_TO_EMAIL` | Email address that receives contact form submissions |
| `RESEND_AUDIENCE_ID` | Resend Audience ID for newsletter signups |

## Content

### Blog posts (Insights)
Add MDX files to `/content/posts/`. Required frontmatter:
```yaml
---
title: 'Post title'
date: '2025-01-15'
excerpt: 'One-sentence description for the post list and RSS feed.'
tags: ['Bayesian Thinking', 'Market Commentary']
---
```

### Placeholders
Search for `[PLACEHOLDER` to find all content that Luke needs to fill in:
```bash
grep -r "\[PLACEHOLDER" content/ src/
```

## Design Tokens

All tokens defined in `src/app/globals.css` under `@theme`:

| Token | Value | Use |
|-------|-------|-----|
| `lm-bg` | `#0B1426` | Page background (deep navy) |
| `lm-surface` | `#111E36` | Card / section backgrounds |
| `lm-cream` | `#F4EFE6` | Primary text, headings |
| `lm-cream-muted` | `#C9C2B5` | Body text |
| `lm-muted` | `#8A8578` | Labels, timestamps, supporting text |
| `lm-accent` | `#3B82F6` | BayesAIn brand blue (use sparingly) |
| `lm-violet` | `#7C5CFF` | Hover accents |
| `lm-border` | `#1A2847` | Borders, dividers |

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment.

Domain: `lukemillerphd.org` (configure DNS in Vercel project settings)

Add environment variables in: Vercel Dashboard → Project → Settings → Environment Variables
