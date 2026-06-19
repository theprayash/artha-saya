import Link from 'next/link'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowRight, TrendingUp, BookOpen, Zap, Pin } from 'lucide-react'
import NewsletterForm from '@/components/renderer/NewsletterForm'

const CATEGORY_COLORS: Record<string, string> = {
  stocks:        'text-accent border-accent/30 bg-accent/5',
  ipo:           'text-amber-400 border-amber-400/30 bg-amber-400/5',
  'mutual-funds':'text-blue-400 border-blue-400/30 bg-blue-400/5',
  'bonus-share': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  economy:       'text-orange-400 border-orange-400/30 bg-orange-400/5',
  tutorial:      'text-sky-400 border-sky-400/30 bg-sky-400/5',
  general:       'text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface)]',
}

function catStyle(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.general
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function HomePage() {
  const allPublished = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt))
    .limit(7)

  const pinned = allPublished.find(p => p.pinned)
  const latestPosts = allPublished.filter(p => !p.pinned).slice(0, 6)
  const [featured, ...rest] = latestPosts

  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ── */}
        <section className="relative max-w-6xl mx-auto px-5 pt-20 pb-16">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-mono mb-6">
              <Zap size={11} /> Share Market · Artha Saya
            </span>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6" style={{ color: 'var(--text)' }}>
              Invest with{' '}
              <span className="text-accent">clarity.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Share market insights — explained simply, honestly, and free.
              No jargon. No paid tips. Just real education for investors.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold text-sm rounded-lg hover:bg-[#b08838] transition-colors">
                Read the blog <ArrowRight size={15} />
              </Link>
              <Link href="/terms" className="inline-flex items-center gap-2 px-6 py-3 text-sm rounded-lg border transition-colors hover:text-accent"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                Disclaimer
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pinned post ── */}
        {pinned && (
          <section className="max-w-6xl mx-auto px-5 pb-4">
            <Link
              href={`/blog/${pinned.slug}`}
              className="group flex items-start gap-5 rounded-2xl p-6 transition-colors hover:border-[var(--border2)]"
              style={{ background: 'var(--surface)', border: '1px solid rgba(200,167,86,0.3)' }}
            >
              <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5" style={{ background: 'rgba(200,167,86,0.12)' }}>
                <Pin size={15} style={{ color: '#C8A756' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: '#C8A756' }}>Pinned</p>
                <h3 className="font-display font-black text-xl leading-snug mb-1 group-hover:text-accent transition-colors" style={{ color: 'var(--text)' }}>
                  {pinned.title}
                </h3>
                {pinned.excerpt && (
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>{pinned.excerpt}</p>
                )}
              </div>
              <ArrowRight size={16} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
            </Link>
          </section>
        )}

        {/* ── Latest posts ── */}
        <section className="max-w-6xl mx-auto px-5 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Latest</p>
              <h2 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>From the blog</h2>
            </div>
            <Link href="/blog" className="hidden md:inline-flex items-center gap-2 text-sm transition-colors hover:text-accent" style={{ color: 'var(--text-muted)' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <div className="text-center py-24 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)' }}>
              <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
              <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Featured */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="md:col-span-2 group relative rounded-2xl p-8 hover:border-[var(--border2)] transition-colors overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
                  <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border mb-4 ${catStyle(featured.category)}`}>
                    {featured.category}
                  </span>
                  <h3 className="font-display font-black text-2xl md:text-3xl leading-tight mb-3 group-hover:text-accent transition-colors" style={{ color: 'var(--text)' }}>
                    {featured.title}
                  </h3>
                  {featured.excerpt && (
                    <p className="text-sm leading-relaxed line-clamp-3 mb-6" style={{ color: 'var(--text-muted)' }}>{featured.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(featured.createdAt)}</span>
                    <span className="text-accent text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              )}

              {/* Side cards */}
              <div className="flex flex-col gap-4">
                {rest.slice(0, 3).map(post => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-xl p-5 transition-colors hover:border-[var(--border2)]"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border mb-2.5 ${catStyle(post.category)}`}>
                      {post.category}
                    </span>
                    <h4 className="font-display font-bold text-sm leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2" style={{ color: 'var(--text)' }}>
                      {post.title}
                    </h4>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>{fmtDate(post.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {latestPosts.length > 0 && (
            <div className="mt-6 md:hidden text-center">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm hover:text-accent transition-colors" style={{ color: 'var(--text-muted)' }}>
                View all posts <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* ── Why Artha Saya ── */}
        <section className="border-t py-20" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>Why us</p>
              <h2 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>Built for real investors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <BookOpen size={20} className="text-accent" />,
                  title: 'Simple Language',
                  desc: 'We break down IPOs, bonus shares, market mechanics, and investment concepts the way no textbook does — plain and honest.',
                },
                {
                  icon: <TrendingUp size={20} className="text-accent" />,
                  title: 'Market Focused',
                  desc: 'Deep dives into stocks, mutual funds, brokers, and everything that matters for retail investors navigating the market.',
                },
                {
                  icon: <Zap size={20} className="text-accent" />,
                  title: 'Always Free',
                  desc: 'No paywalls, no paid tips, no subscriptions. Quality financial education should be accessible to everyone.',
                },
              ].map(card => (
                <div key={card.title} className="rounded-xl p-6" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--text)' }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="max-w-6xl mx-auto px-5 py-20">
          <div className="rounded-2xl p-10 text-center max-w-2xl mx-auto" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'var(--text-faint)' }}>Weekly digest</p>
            <h2 className="font-display font-black text-3xl mb-3" style={{ color: 'var(--text)' }}>
              Market insights in your inbox
            </h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Weekly round-up of the share market — top movers, IPO alerts, and market commentary. Free, always.
            </p>
            <NewsletterForm buttonLabel="Subscribe" />
            <p className="text-xs mt-4 font-mono" style={{ color: 'var(--text-faint)' }}>
              No spam. Unsubscribe anytime. Not financial advice.
            </p>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
