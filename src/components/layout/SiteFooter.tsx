import Link from 'next/link'
import NewsletterForm from '@/components/renderer/NewsletterForm'

const LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Terms & Disclaimer', href: '/terms' },
]

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2 font-display font-black text-xl" style={{ color: 'var(--text)' }}>
              <span className="text-accent">◆</span> Artha Sage
            </Link>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Share market insights explained simply — for investors who want clarity over hype.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="text-xs uppercase tracking-widest font-mono mb-4" style={{ color: 'var(--text-faint)' }}>Navigate</p>
            <ul className="space-y-2">
              {LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="max-w-xs">
            <p className="text-xs uppercase tracking-widest font-mono mb-4" style={{ color: 'var(--text-faint)' }}>Weekly Digest</p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              Market insights every week. No spam.
            </p>
            <NewsletterForm buttonLabel="Join" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
          <span>© {year} Artha Sage. All rights reserved.</span>
          <span>Not financial advice · For educational purposes only</span>
        </div>
      </div>
    </footer>
  )
}
