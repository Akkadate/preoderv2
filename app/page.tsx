import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  Pricing,
  FAQ,
  CTA,
  Footer
} from '@/components/landing'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
