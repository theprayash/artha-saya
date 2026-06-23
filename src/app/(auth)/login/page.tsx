'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const justSetup = params.get('setup') === 'done'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="Logo" width={160} height={54} className="h-12 w-auto object-contain" />
        </Link>
        <p className="text-[var(--text-muted)] text-sm mt-2">Admin Sign In</p>
      </div>

      {justSetup && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-accent/30 bg-accent/5 text-accent text-sm text-center">
          Account created! Sign in below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-[var(--text-faint)]"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm text-center py-2 px-3 rounded-lg bg-danger/5 border border-danger/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text-faint)] mt-6">
        No account yet?{' '}
        <Link href="/setup" className="text-[var(--text-muted)] hover:text-accent transition-colors">
          Create first admin
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
