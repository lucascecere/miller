'use client'

import { useState } from 'react'

interface Props {
  className?: string
}

export function NewsletterSignup({ className }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data?.error ?? 'Failed to subscribe. Please try again.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-sm text-lm-cream-muted">You&apos;re subscribed. I&apos;ll be in touch.</p>
    )
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            disabled={status === 'loading'}
            className="flex-1 bg-lm-bg border border-lm-border rounded-sm px-4 py-2.5 text-sm text-lm-cream placeholder:text-lm-muted focus:outline-none focus:border-lm-cream/30 focus-visible:ring-2 focus-visible:ring-lm-cream/30 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm px-5 py-2.5 transition-colors flex-shrink-0"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
      )}
    </div>
  )
}
