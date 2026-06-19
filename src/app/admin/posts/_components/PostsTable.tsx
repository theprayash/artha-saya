'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Eye, EyeOff, Pin, PinOff } from 'lucide-react'
import { deletePost, togglePublish, togglePin } from '@/lib/actions/posts'
import type { Post, Category } from '@/lib/db/schema'

interface Props {
  posts: Post[]
  categories: Category[]
}

const FILTERS = ['All', 'Published', 'Draft']

export default function PostsTable({ posts, categories }: Props) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()

  const catMap = Object.fromEntries(categories.map(c => [c.slug, c]))

  const visible = posts.filter(p => {
    if (filter === 'Published' && !p.published) return false
    if (filter === 'Draft' && p.published) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(() => deletePost(id))
  }

  const handleToggle = (id: string, current: boolean) => {
    startTransition(() => togglePublish(id, !current))
  }

  const handlePin = (id: string, current: boolean) => {
    startTransition(() => togglePin(id, !current))
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Filters */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-3"
        style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-mono transition-colors"
              style={{
                color: filter === f ? '#C8A756' : 'var(--text-faint)',
                background: filter === f ? 'rgba(200,167,86,0.12)' : 'transparent',
                border: filter === f ? '1px solid rgba(200,167,86,0.35)' : '1px solid transparent',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="text-sm px-3 py-1.5 rounded-lg focus:outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            width: 220,
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)' }}>
        {visible.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No articles found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-faint)' }}>
                {['Title', 'Category', 'Views', 'Status', 'Date', 'Actions', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-mono uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(post => {
                const cat = catMap[post.category]
                return (
                  <tr key={post.id} style={{ borderBottom: '1px solid var(--border)' }} className="group">
                    <td className="px-5 py-3 max-w-xs">
                      <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{post.title}</p>
                      {post.excerpt && (
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-faint)' }}>{post.excerpt}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border whitespace-nowrap"
                        style={{
                          color: cat?.color ?? '#888',
                          borderColor: (cat?.color ?? '#888') + '40',
                          background: (cat?.color ?? '#888') + '10',
                        }}
                      >
                        {post.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {post.viewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border"
                        style={post.published
                          ? { color: '#C8A756', background: 'rgba(200,167,86,0.12)', borderColor: 'rgba(200,167,86,0.35)' }
                          : { color: 'var(--text-faint)', borderColor: 'var(--border)' }
                        }
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--text-faint)' }}>
                      {post.createdAt.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded hover:bg-accent/10 text-accent transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </Link>
                        <button
                          onClick={() => handleToggle(post.id, post.published)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          title={post.published ? 'Unpublish' : 'Publish'}
                        >
                          {post.published ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-1.5 rounded hover:bg-danger/10 text-danger transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                    {/* Pin */}
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handlePin(post.id, post.pinned)}
                        className="p-1.5 rounded transition-colors"
                        title={post.pinned ? 'Unpin' : 'Pin to top'}
                        style={{ color: post.pinned ? '#C8A756' : 'var(--text-faint)' }}
                      >
                        {post.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
