import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { TrustBand } from '@/components/TrustBand'
import { WhoWeServe } from '@/components/WhoWeServe'
import { OurApproach } from '@/components/OurApproach'
import { Leadership } from '@/components/Leadership'
import { CTASection } from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Nav />
      <Hero />
      <TrustBand />
      <WhoWeServe />
      <OurApproach />
      <Leadership />
      <CTASection />
      <Footer />
    </main>
  )
}
