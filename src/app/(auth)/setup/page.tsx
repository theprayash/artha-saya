'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { createFirstAdmin } from '@/lib/actions/auth'

export default function SetupPage() {
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await createFirstAdmin(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, createFirstAdmin redirects to /login?setup=done
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="Logo" width={160} height={54} className="h-12 w-auto object-contain" />
        </Link>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <ShieldCheck size={14} className="text-accent" />
          <p className="text-[var(--text-muted)] text-sm">Create First Admin Account</p>
        </div>
      </div>

      <div className="mb-5 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)] leading-relaxed">
        This page is only accessible once — when no admin exists. After creation, it will be locked.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Full Name</label>
          <input
            name="name"
            autoFocus
            placeholder="Your Name"
            required
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            placeholder="admin@example.com"
            required
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]"
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)]">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">Confirm Password</label>
          <input
            name="confirm"
            type={showPw ? 'text' : 'password'}
            placeholder="Repeat password"
            required
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]"
          />
        </div>

        {error && (
          <p className="text-danger text-sm text-center py-2 px-3 rounded-lg bg-danger/5 border border-danger/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create Admin Account →'}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-faint)] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--text-muted)] hover:text-accent transition-colors">Sign in</Link>
      </p>
    </div>
  )
}
