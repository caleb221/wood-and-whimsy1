import { Card, CardContent } from "@/components/ui/card"
import { Truck, Shield, Wrench, Heart } from "lucide-react"
import Image from "next/image"
import React from "react"

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Complimentary shipping on orders over $500",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: Shield,
    title: "3-Year Warranty",
    description: "Comprehensive protection on all furniture",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: Wrench,
    title: "Assembly Service",
    description: "Professional setup in your home",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Handcrafted by skilled artisans",
    color: "from-red-400 to-pink-500",
  },
]

export default function About() {
  return (
    <section className="section" style={{ animation: 'fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both' }}>
      <h2>About Us</h2>
      <p>At Wood & Whimsy, we blend craftsmanship and creativity to bring you premium furniture and a cozy café experience. Our mission is to create beautiful, sustainable pieces that transform your space and your day.</p>
      <ul style={{ marginTop: '1.5rem', color: '#134e4a', fontWeight: 500 }}>
        <li>🌱 Sustainable materials & ethical sourcing</li>
        <li>🪑 Handcrafted, unique furniture</li>
        <li>☕ Artisan coffee & warm atmosphere</li>
        <li>💚 Community-focused & customer-first</li>
      </ul>
    </section>
  )
}
