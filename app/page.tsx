import HeroSection from "@/components/hero-section"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import Testimonials from "@/components/testimonials"
import JobPortalCTA from "@/components/JobPortalCTA"
import Pricing from "@/components/pricing"
import ServicesCarousel from "@/components/ServicesCarousel"

export default function Home() {
  return (
    <div className="">
      <HeroSection />
      <Features />
       <ServicesCarousel/>
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <JobPortalCTA/>
    </div>
  )
}
