import { db } from '@/lib/db'
import { posts, newsletterSubscribers, categories } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import Link from 'next/link'
import { FileText, Eye, Users, Tag, TrendingUp, Plus, ArrowRight } from 'lucide-react'

function StatCard({ label, value, icon: Icon, sub }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
          {label}
        </p>
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon size={15} className="text-accent" />
        </div>
      </div>
      <p className="text-3xl font-display font-black" style={{ color: 'var(--text)' }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  const [allPosts, subs, cats] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.createdAt)),
    db.select({ count: sql<number>`count(*)` }).from(newsletterSubscribers),
    db.select().from(categories),
  ])

  const published = allPosts.filter(p => p.published)
  const drafts = allPosts.filter(p => !p.published)
  const totalViews = allPosts.reduce((s, p) => s + p.viewCount, 0)
  const recentPosts = allPosts.slice(0, 8)

  const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
    cats.map(c => [c.slug, c.color])
  )

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Welcome back — here&apos;s your overview.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-[#b08838] transition-colors"
        >
          <Plus size={15} /> New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={allPosts.length} icon={FileText} sub={`${published.length} published · ${drafts.length} drafts`} />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} sub="across all articles" />
        <StatCard label="Subscribers" value={Number(subs[0]?.count ?? 0).toLocaleString()} icon={Users} sub="newsletter" />
        <StatCard label="Categories" value={cats.length} icon={Tag} sub="active" />
      </div>

      {/* Recent articles */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>Recent Articles</h2>
          </div>
          <Link href="/admin/posts" className="text-xs text-accent flex items-center gap-1 hover:underline">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        <div style={{ background: 'var(--surface)' }}>
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No articles yet.</p>
              <Link href="/admin/posts/new" className="text-accent text-sm mt-2 inline-block hover:underline">
                Write your first article →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                  {['Title', 'Category', 'Views', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPosts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }} className="group">
                    <td className="px-5 py-3 max-w-xs">
                      <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border"
                        style={{
                          color: CATEGORY_COLORS[post.category] ?? '#888',
                          borderColor: (CATEGORY_COLORS[post.category] ?? '#888') + '40',
                          background: (CATEGORY_COLORS[post.category] ?? '#888') + '10',
                        }}
                      >
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {post.viewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        post.published
                          ? 'text-accent bg-accent/10 border border-accent/20'
                          : 'border'
                      }`}
                      style={!post.published ? { color: 'var(--text-faint)', borderColor: 'var(--border)' } : {}}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
                      {post.createdAt.toLocaleDateString('en-NP', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
