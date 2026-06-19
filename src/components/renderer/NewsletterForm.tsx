'use client'

import { useState } from 'react'
import { subscribe } from '@/lib/actions/newsletter'

export default function NewsletterForm({ buttonLabel }: { buttonLabel: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    const result = await subscribe(email)
    if (result.success) {
      setState('success')
      setEmail('')
    } else {
      setState('error')
      setMessage(result.error ?? 'Something went wrong.')
    }
  }

  if (state === 'success') {
    return <p className="text-accent font-semibold">You&apos;re in! Check your inbox soon.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
        required
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="px-5 py-2.5 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {state === 'loading' ? '...' : buttonLabel}
      </button>
      {state === 'error' && <p className="absolute mt-12 text-danger text-xs">{message}</p>}
    </form>
  )
}
