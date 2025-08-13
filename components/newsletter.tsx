"use client"

import React from "react"

export default function Newsletter() {
  return (
    <section className="section" style={{ animation: 'fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both', maxWidth: 500, margin: '2rem auto' }}>
      <h2>Subscribe to Our Newsletter</h2>
      <p>Get the latest updates, offers, and inspiration delivered to your inbox.</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <input type="email" placeholder="Your Email" required className="input" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1fae5' }} />
        <button type="submit" className="btn" style={{ background: '#10b981', color: '#fff', borderRadius: '9999px', fontWeight: 600, fontSize: '1rem', padding: '0.75rem', marginTop: '0.5rem', boxShadow: '0 2px 8px rgba(16,185,129,0.10)' }}>
          Subscribe
        </button>
      </form>
    </section>
  )
}
