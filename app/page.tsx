 import Header from "@/components/LandingPage/Header"
import Hero from "@/components/LandingPage/Hero"
import Features from "@/components/LandingPage/Features"
import About from "@/components/LandingPage/About"
import Footer from "@/components/LandingPage/Footer"
import ShoutoutsRail from "@/components/LandingPage/ShoutoutsRail"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      <Hero />
      {/* Main content with shoutouts rail */}
      <div className="px-6 py-12">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-12">
            <Features />
            <About />
          </div>
          <div className="lg:col-span-4">
            <ShoutoutsRail />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}