'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Terms', href: '/terms' },
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur border-b"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      {/* Main nav row */}
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo.png" alt="Logo" width={120} height={40} className="h-9 w-auto object-contain" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ color: pathname === link.href ? '#C8A756' : 'var(--text-muted)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>


      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-5 py-4 space-y-1"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm transition-colors"
              style={{
                color: pathname === link.href ? '#C8A756' : 'var(--text-muted)',
                background: pathname === link.href ? 'rgba(200,167,86,0.1)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
