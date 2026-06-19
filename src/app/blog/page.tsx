import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { BookOpen, ArrowRight, Pin } from 'lucide-react'

const CATEGORIES = [
  { id: 'all',          label: 'All' },
  { id: 'stocks',       label: 'Stocks' },
  { id: 'ipo',          label: 'IPO / FPO' },
  { id: 'mutual-funds', label: 'Mutual Funds' },
  { id: 'bonus-share',  label: 'Bonus Share' },
  { id: 'economy',      label: 'Economy' },
  { id: 'tutorial',     label: 'Tutorial' },
  { id: 'general',      label: 'General' },
]

const CATEGORY_COLORS: Record<string, string> = {
  stocks:        'text-accent border-accent/30 bg-accent/5',
  ipo:           'text-amber-400 border-amber-400/30 bg-amber-400/5',
  'mutual-funds':'text-blue-400 border-blue-400/30 bg-blue-400/5',
  'bonus-share': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  economy:       'text-orange-400 border-orange-400/30 bg-orange-400/5',
  tutorial:      'text-sky-400 border-sky-400/30 bg-sky-400/5',
  general:       'text-[var(--text-muted)] border-[var(--border)] bg-transparent',
}

function catStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.general
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category && category !== 'all' ? category : null

  const allPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt))

  const filtered = activeCategory
    ? allPosts.filter(p => p.category === activeCategory)
    : allPosts

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-5 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
            Artha Saya · नेपाल सेयर बजार
          </p>
          <h1 className="font-display font-black text-5xl md:text-6xl mb-4" style={{ color: 'var(--text)' }}>Blog</h1>
          <p className="text-lg max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Share market insights, IPO analysis, stock education, and honest commentary — all free.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => {
            const isActive = cat.id === 'all' ? !activeCategory : activeCategory === cat.id
            const count = cat.id === 'all' ? allPosts.length : allPosts.filter(p => p.category === cat.id).length
            return (
              <Link
                key={cat.id}
                href={cat.id === 'all' ? '/blog' : `/blog?category=${cat.id}`}
                className="px-4 py-1.5 rounded-full border text-xs font-mono transition-colors"
                style={{
                  color: isActive ? '#C8A756' : 'var(--text-faint)',
                  background: isActive ? 'rgba(200,167,86,0.1)' : 'transparent',
                  borderColor: isActive ? 'rgba(200,167,86,0.5)' : 'var(--border)',
                }}
              >
                {cat.label}
                {cat.id !== 'all' && count > 0 && (
                  <span className="ml-1.5 opacity-50">{count}</span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Posts grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-32 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)' }}>
            <BookOpen size={36} className="mx-auto mb-4" style={{ color: 'var(--text-faint)' }} />
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No posts in this category yet.</p>
            <Link href="/blog" className="text-accent text-sm mt-2 inline-block hover:underline">
              View all posts →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group rounded-xl p-6 transition-colors flex flex-col ${
                  i === 0 && !activeCategory ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${catStyle(post.category)}`}>
                    {post.category}
                  </span>
                  {post.pinned && (
                    <span className="flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border"
                      style={{ color: '#C8A756', borderColor: 'rgba(200,167,86,0.4)', background: 'rgba(200,167,86,0.08)' }}>
                      <Pin size={9} /> Pinned
                    </span>
                  )}
                </div>
                <h2
                  className={`font-display font-black leading-tight mb-3 group-hover:text-accent transition-colors ${
                    i === 0 && !activeCategory ? 'text-2xl md:text-3xl' : 'text-lg'
                  }`}
                  style={{ color: 'var(--text)' }}
                >
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm leading-relaxed line-clamp-3 mb-4 flex-1" style={{ color: 'var(--text-muted)' }}>
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(post.createdAt)}</span>
                  <span className="text-accent text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
