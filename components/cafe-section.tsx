import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Coffee, Clock, Star, Leaf } from "lucide-react"
import Image from "next/image"
import React from "react"

export default function CafeSection() {
  const menu = [
    { name: "Espresso", price: "$3" },
    { name: "Cappuccino", price: "$4" },
    { name: "Latte", price: "$4.5" },
    { name: "Herbal Tea", price: "$3.5" },
    { name: "Pastries", price: "$2 - $4" },
  ]
  return (
    <section className="section" style={{ animation: 'fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both', maxWidth: 600, margin: '2rem auto' }}>
      <h2>Café Menu</h2>
      <p>Enjoy artisan coffee, tea, and fresh pastries in our cozy café corner.</p>
      <ul style={{ marginTop: '2rem', padding: 0, listStyle: 'none' }}>
        {menu.map((item, i) => (
          <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #d1fae5', fontWeight: 500, color: '#134e4a' }}>
            <span>{item.name}</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{item.price}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
