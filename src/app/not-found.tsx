import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-5 py-32 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <FileQuestion size={28} style={{ color: 'var(--text-faint)' }} />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>404</p>
        <h1 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--text)' }}>
          Page not found
        </h1>
        <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg border transition-colors hover:text-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={14} /> Browse blog
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
