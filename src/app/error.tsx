'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center px-5 text-center"
      style={{ background: 'var(--bg)' }}>
      <div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8"
          style={{ background: 'rgba(255,69,69,0.08)', border: '1px solid rgba(255,69,69,0.2)' }}>
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>Error</p>
        <h1 className="font-display font-black text-3xl md:text-4xl mb-4" style={{ color: 'var(--text)' }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          An unexpected error occurred. Try again or go back home.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 text-sm rounded-lg border transition-colors hover:text-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
