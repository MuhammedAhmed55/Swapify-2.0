 import Header from "@/components/LandingPage/Header"
 import Hero from "@/components/LandingPage/Hero"
 import Features from "@/components/LandingPage/Features"
 import About from "@/components/LandingPage/About"
 import Footer from "@/components/LandingPage/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <Hero />
      <Features />
      <About />
      <Footer />
    </div>
  )
}