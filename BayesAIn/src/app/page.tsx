import type { Metadata } from 'next'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/home/Hero'
import { SelectedWork } from '@/components/home/SelectedWork'
import { AboutPreview } from '@/components/home/AboutPreview'
import { LogoBand } from '@/components/home/LogoBand'
import { RecentResearch } from '@/components/home/RecentResearch'
import { getRecentPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Luke Miller, PhD — Bayesian Decision Systems',
  description:
    'Finance professor and Bayesian timing analyst. The framework maps probability distributions across key market junctures. Published weekly through Elliott Wave Trader.',
  openGraph: {
    title: 'Luke Miller, PhD — Bayesian Decision Systems',
    description:
      'Finance professor and Bayesian timing analyst. The framework maps probability distributions across key market junctures. Published weekly through Elliott Wave Trader.',
    url: 'https://lukemillerphd.org',
    type: 'website',
  },
  alternates: { canonical: 'https://lukemillerphd.org' },
}

export default function HomePage() {
  const recentPosts = getRecentPosts(3)
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <LogoBand />
        <SelectedWork />
        <AboutPreview />
        <RecentResearch posts={recentPosts} />
      </main>
      <Footer />
    </>
  )
}
