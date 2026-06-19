'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Tag, Settings,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Articles', icon: FileText, exact: false },
  { href: '/admin/categories', label: 'Categories', icon: Tag, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="p-3 flex-1 space-y-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              color: active ? '#C8A756' : 'var(--text-muted)',
              background: active ? 'rgba(200,167,86,0.12)' : 'transparent',
              fontWeight: active ? 600 : 400,
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
