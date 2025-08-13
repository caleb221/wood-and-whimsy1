"use client"

import React from "react"

export default function FeaturedProducts() {
  // Example products (replace with real data)
  const products = [
    { name: "Harmony Dining Table", img: "/dining-room04.jpg", price: "$799" },
    { name: "Cozy Sofa", img: "/cozy sofa.jpg", price: "$599" },
    { name: "Executive Chair", img: "/office chair.jpg", price: "$299" },
  ]
  return (
    <section className="section" style={{ animation: 'fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both' }}>
      <h2>Featured Products</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
        {products.map((p, i) => (
          <div key={i} className="card" style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 16px rgba(16,185,129,0.08)', padding: '1.5rem', width: 240, textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 32px rgba(16,185,129,0.12)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(16,185,129,0.08)'; }}
          >
            <img src={p.img} alt={p.name} style={{ width: '100%', borderRadius: '1rem', marginBottom: '1rem', objectFit: 'cover', height: 120 }} />
            <h3 style={{ color: '#10b981', fontWeight: 700 }}>{p.name}</h3>
            <p style={{ color: '#134e4a', fontWeight: 600, fontSize: '1.1rem', marginTop: 8 }}>{p.price}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
