"use client"

import React from "react"

export default function Contact() {
  return (
    <section className="section" style={{ animation: 'fadeInUp 0.7s cubic-bezier(.4,0,.2,1) both', maxWidth: 500, margin: '2rem auto' }}>
      <h2>Contact Us</h2>
      <p>We'd love to hear from you! Fill out the form below and our team will get back to you soon.</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <input type="text" placeholder="Your Name" required className="input" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1fae5' }} />
        <input type="email" placeholder="Your Email" required className="input" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1fae5' }} />
        <textarea placeholder="Your Message" required className="input" style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1fae5', minHeight: 100 }} />
        <button type="submit" className="btn" style={{ background: '#10b981', color: '#fff', borderRadius: '9999px', fontWeight: 600, fontSize: '1rem', padding: '0.75rem', marginTop: '0.5rem', boxShadow: '0 2px 8px rgba(16,185,129,0.10)' }}>
          Send Message
        </button>
      </form>
    </section>
  )
}
