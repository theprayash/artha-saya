'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const justSetup = params.get('setup') === 'done'

  // Step 1: email+password → Step 2: OTP
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Step 2 fields — 6 individual digit boxes
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const digitRefs = useRef<Array<HTMLInputElement | null>>([])

  // Shared state
  const [maskedEmail, setMaskedEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Step 1: verify password, send OTP
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    setMaskedEmail(data.maskedEmail)
    setResendCooldown(60)
    setDigits(['', '', '', '', '', ''])
    setStep(2)
    setLoading(false)
    // Auto-focus first digit
    setTimeout(() => digitRefs.current[0]?.focus(), 80)
  }

  // Step 2: verify OTP, create session
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) return
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      otp,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid or expired code. Try again.')
      setDigits(['', '', '', '', '', ''])
      setLoading(false)
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } else {
      router.push('/admin')
    }
  }

  const handleDigitChange = (idx: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = char
    setDigits(next)
    if (char && idx < 5) digitRefs.current[idx + 1]?.focus()
  }

  const handleDigitKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'Enter') {
      const otp = digits.join('')
      if (otp.length === 6) handleStep2(e as unknown as React.FormEvent)
    }
  }

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    const focusIdx = Math.min(pasted.length, 5)
    digitRefs.current[focusIdx]?.focus()
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setResendCooldown(60)
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } else {
      setError(data.error ?? 'Failed to resend.')
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

      {/* ── STEP 1: Email + Password ── */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
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
            {loading ? 'Sending code...' : 'Continue →'}
          </button>
        </form>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <Mail size={16} className="text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[var(--text)]">Code sent</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                We emailed a 6-digit code to <span className="text-[var(--text)]">{maskedEmail}</span>. Expires in 5 minutes.
              </p>
            </div>
          </div>

          {/* 6 digit boxes */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Enter code
            </label>
            <div className="flex gap-2" onPaste={handleDigitPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { digitRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleDigitKeyDown(i, e)}
                  className="flex-1 aspect-square text-center text-2xl font-mono font-bold bg-[var(--surface)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-danger text-sm text-center py-2 px-3 rounded-lg bg-danger/5 border border-danger/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            className="w-full py-3 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In →'}
          </button>

          {/* Resend + back */}
          <div className="flex items-center justify-between text-xs text-[var(--text-faint)]">
            <button
              type="button"
              onClick={() => { setStep(1); setError('') }}
              className="flex items-center gap-1 hover:text-[var(--text-muted)] transition-colors"
            >
              <ArrowLeft size={12} /> Back
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="hover:text-[var(--text-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

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
