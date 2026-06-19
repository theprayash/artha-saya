import { cache } from 'react'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowLeft } from 'lucide-react'
import { incrementViewCount } from '@/lib/actions/posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const CATEGORY_COLORS: Record<string, string> = {
  stocks:        'text-accent border-accent/30 bg-accent/5',
  ipo:           'text-amber-400 border-amber-400/30 bg-amber-400/5',
  'mutual-funds':'text-blue-400 border-blue-400/30 bg-blue-400/5',
  'bonus-share': 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  economy:       'text-orange-400 border-orange-400/30 bg-orange-400/5',
  tutorial:      'text-sky-400 border-sky-400/30 bg-sky-400/5',
}

interface Props {
  params: Promise<{ slug: string }>
}

// Deduplicated across generateMetadata + page component within one request
const getPost = cache(async (slug: string) => {
  return db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.published, true)),
  })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const title = post.title
  const description = post.excerpt || undefined

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${slug}`,
      title,
      description,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      section: post.category,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  incrementViewCount(post.id).catch(() => {})

  const color = CATEGORY_COLORS[post.category] ?? 'text-[var(--text-muted)] border-[var(--border)] bg-transparent'
  const date = post.createdAt.toLocaleDateString('en-NP', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    author: { '@type': 'Organization', name: 'Artha Sage', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Artha Sage',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    articleSection: post.category,
    inLanguage: 'en-US',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-5 py-10 md:py-16">

        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-accent mb-7 md:mb-10"
          style={{ color: 'var(--text-faint)' }}
        >
          <ArrowLeft size={14} /> Back to blog
        </Link>

        {/* Meta */}
        <div className="mb-6 md:mb-8">
          <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 md:mb-4 ${color}`}>
            {post.category}
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl leading-tight mb-3 md:mb-4" style={{ color: 'var(--text)' }}>
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
            <span>{date}</span>
            <span>·</span>
            <span>{post.viewCount.toLocaleString()} views</span>
          </div>
        </div>

        <div className="border-t mb-10" style={{ borderColor: 'var(--border)' }} />

        {/* Content */}
        {post.content ? (
          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--text-faint)' }}>No content yet.</p>
        )}

        {/* Per-article disclaimer */}
        <div
          className="mt-16 p-5 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <p className="text-amber-400 text-xs font-mono font-semibold mb-1 uppercase tracking-widest">
            Disclaimer · लगानी जोखिम सूचना
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            This article is for educational purposes only and does not constitute financial or investment advice.
            Artha Sage is not registered with SEBON. Always consult a licensed Nepali financial advisor before investing.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export async function generateStaticParams() {
  const allPosts = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.published, true))
  return allPosts.map(p => ({ slug: p.slug }))
}
