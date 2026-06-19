import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { logOut } from '@/lib/actions/auth'
import { LogOut, ExternalLink } from 'lucide-react'
import AdminNav from './_components/NavLink'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <aside
        className="w-60 shrink-0 flex flex-col"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Brand */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/" className="flex items-center gap-2 font-display font-black text-base">
            <span className="text-accent">◆</span>
            <span style={{ color: 'var(--text)' }}>Artha Saya</span>
          </Link>
        </div>

        {/* Nav — client component owns the icon components */}
        <AdminNav />

        {/* User + logout */}
        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={13} /> View site
          </a>

          {session?.user && (
            <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--surface2)' }}>
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                {session.user.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
                {session.user.email}
              </p>
            </div>
          )}

          <form action={async () => { 'use server'; await logOut() }}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-red-500/10 hover:text-red-400"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
