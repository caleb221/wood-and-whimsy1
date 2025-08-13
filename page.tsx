import { Hero } from "@/components/hero"
import { Categories } from "@/components/categories"
import { FeaturedProducts } from "@/components/featured-products"
import { About } from "@/components/about"
import { CafeSection } from "@/components/cafe-section"
import { Contact } from "@/components/contact"
import { Newsletter } from "@/components/newsletter"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <CafeSection />
      <About />
      <Contact />
      <Newsletter />
    </main>
  )
}
