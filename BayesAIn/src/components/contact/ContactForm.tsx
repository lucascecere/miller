'use client'

import { useState } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string) ?? ''
    const email = (formData.get('email') as string) ?? ''
    const inquiryType = (formData.get('topic') as string) ?? 'General'
    const message = (formData.get('message') as string) ?? ''

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, inquiryType, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data?.error ?? 'Failed to send message. Please try again.')
      } else {
        setStatus('success')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Failed to send message. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-lm-cream-muted">
        Your message has been sent. I&apos;ll be in touch soon.
      </p>
    )
  }

  const isLoading = status === 'loading'

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm text-lm-cream-muted mb-2">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isLoading}
          className="w-full bg-lm-surface border border-lm-border rounded-sm px-4 py-3 text-lm-cream placeholder:text-lm-muted focus:outline-none focus:border-lm-accent focus-visible:ring-2 focus-visible:ring-lm-cream/30 transition-colors text-sm disabled:opacity-50"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-lm-cream-muted mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          className="w-full bg-lm-surface border border-lm-border rounded-sm px-4 py-3 text-lm-cream placeholder:text-lm-muted focus:outline-none focus:border-lm-accent focus-visible:ring-2 focus-visible:ring-lm-cream/30 transition-colors text-sm disabled:opacity-50"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="topic" className="block text-sm text-lm-cream-muted mb-2">
          Topic
        </label>
        <select
          id="topic"
          name="topic"
          required
          defaultValue=""
          disabled={isLoading}
          className="w-full bg-lm-surface border border-lm-border rounded-sm px-4 py-3 text-lm-cream focus:outline-none focus:border-lm-accent focus-visible:ring-2 focus-visible:ring-lm-cream/30 transition-colors text-sm appearance-none disabled:opacity-50"
        >
          <option value="" disabled>Select a topic</option>
          <option value="Consulting">Consulting</option>
          <option value="Media & Speaking">Media &amp; Speaking</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-lm-cream-muted mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          disabled={isLoading}
          className="w-full bg-lm-surface border border-lm-border rounded-sm px-4 py-3 text-lm-cream placeholder:text-lm-muted focus:outline-none focus:border-lm-accent focus-visible:ring-2 focus-visible:ring-lm-cream/30 transition-colors text-sm resize-none disabled:opacity-50"
          placeholder="How can I help?"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 bg-lm-accent text-white text-sm font-sans hover:bg-lm-accent/90 transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending...' : 'Send message'}
      </button>

      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
      )}
    </form>
  )
}
