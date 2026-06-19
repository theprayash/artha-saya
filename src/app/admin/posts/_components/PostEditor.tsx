'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Save, Eye, EyeOff, Trash2, ArrowLeft, Loader2, Pin, PinOff } from 'lucide-react'
import { createPost, updatePost, deletePost, togglePin } from '@/lib/actions/posts'
import type { Post, Category } from '@/lib/db/schema'

// Load Tiptap only on client
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl border flex items-center justify-center"
      style={{ height: 400, borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-faint)' }}
    >
      <Loader2 size={20} className="animate-spin" />
    </div>
  ),
})

interface Props {
  post?: Post
  categories: Category[]
}

const DEFAULT_CATS = ['stocks', 'ipo', 'mutual-funds', 'crypto', 'economy', 'tutorial', 'general']

export default function PostEditor({ post, categories }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [category, setCategory] = useState(post?.category ?? 'general')
  const [content, setContent] = useState(post?.content ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [pinned, setPinned] = useState(post?.pinned ?? false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const catOptions = categories.length > 0
    ? categories.map(c => c.slug)
    : DEFAULT_CATS

  const save = async (pub?: boolean) => {
    if (!title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError('')
    const publishVal = pub !== undefined ? pub : published

    try {
      if (post) {
        await updatePost(post.id, { title, excerpt, category, content, published: publishVal })
      } else {
        const created = await createPost({ title, excerpt, category, content, published: publishVal })
        router.replace(`/admin/posts/${created.id}/edit`)
      }
      setPublished(publishVal)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!post) return
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deletePost(post.id)
      router.push('/admin/posts')
    })
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/admin/posts')}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-accent"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-danger">{error}</span>}
          {saved && <span className="text-xs text-accent">✓ Saved</span>}
          {post && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-danger/20 text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
          {post && (
            <button
              onClick={() => {
                const next = !pinned
                setPinned(next)
                startTransition(() => togglePin(post.id, next))
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors"
              style={pinned
                ? { borderColor: 'rgba(200,167,86,0.4)', color: '#C8A756', background: 'rgba(200,167,86,0.08)' }
                : { borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }
              }
              title={pinned ? 'Unpin from top' : 'Pin to top of blog'}
            >
              {pinned ? <><PinOff size={13} /> Pinned</> : <><Pin size={13} /> Pin</>}
            </button>
          )}
          <button
            onClick={() => save(!published)}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
          >
            {published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
          </button>
          <button
            onClick={() => save()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-[#b08838] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border"
          style={published
            ? { color: '#C8A756', background: 'rgba(200,167,86,0.12)', borderColor: 'rgba(200,167,86,0.35)' }
            : { color: 'var(--text-faint)', borderColor: 'var(--border)' }
          }
        >
          {published ? 'Published' : 'Draft'}
        </span>
        {pinned && (
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border flex items-center gap-1"
            style={{ color: '#C8A756', background: 'rgba(200,167,86,0.08)', borderColor: 'rgba(200,167,86,0.3)' }}>
            <Pin size={9} /> Pinned
          </span>
        )}
        {post && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            View live ↗
          </a>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Article title..."
        className="w-full text-4xl font-display font-black bg-transparent border-none focus:outline-none placeholder:opacity-20"
        style={{ color: 'var(--text)' }}
      />

      {/* Meta row */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
            Category
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {catOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
            Excerpt (shown in listing)
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Brief description..."
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Tiptap editor */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--text-faint)' }}>
          Content
        </label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your article..."
        />
      </div>

      <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
        Tip: Use the YouTube button in the toolbar to embed videos directly in your article.
      </p>
    </div>
  )
}
