'use client'

import { useState, useTransition } from 'react'
import { Trash2, Pencil, Plus, Check, X } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/categories'
import type { Category } from '@/lib/db/schema'

const PRESET_COLORS = [
  '#C8A756', '#FF4545', '#F59E0B', '#3B82F6',
  '#A855F7', '#EC4899', '#14B8A6', '#F97316',
]

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full border-2 transition-all"
          style={{
            background: c,
            borderColor: value === c ? 'white' : 'transparent',
            transform: value === c ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border-0"
        title="Custom color"
      />
    </div>
  )
}

function CategoryRow({ cat, onSave, onDelete }: {
  cat: Category
  onSave: (id: string, data: Partial<Category>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const [color, setColor] = useState(cat.color)
  const [desc, setDesc] = useState(cat.description)

  const save = () => {
    onSave(cat.id, { name, color, description: desc })
    setEditing(false)
  }

  const cancel = () => {
    setName(cat.name); setColor(cat.color); setDesc(cat.description)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-1 block" style={{ color: 'var(--text-faint)' }}>Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-1 block" style={{ color: 'var(--text-faint)' }}>Description</label>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-faint)' }}>Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-xs font-semibold rounded-lg">
            <Check size={12} /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl group" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="w-4 h-4 rounded-full shrink-0" style={{ background: cat.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{cat.name}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{cat.slug} · {cat.description || 'No description'}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded hover:bg-accent/10 text-accent transition-colors">
          <Pencil size={13} />
        </button>
        <button
          onClick={() => { if (confirm(`Delete "${cat.name}"?`)) onDelete(cat.id) }}
          className="p-1.5 rounded hover:bg-danger/10 text-danger transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function CategoriesManager({ categories: initialCats }: { categories: Category[] }) {
  const [cats, setCats] = useState(initialCats)
  const [, startTransition] = useTransition()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#C8A756')
  const [newDesc, setNewDesc] = useState('')

  const handleCreate = () => {
    if (!newName.trim()) return
    startTransition(async () => {
      const cat = await createCategory({ name: newName, color: newColor, description: newDesc })
      setCats(prev => [...prev, cat])
      setNewName(''); setNewColor('#C8A756'); setNewDesc('')
      setShowNew(false)
    })
  }

  const handleSave = (id: string, data: Partial<Category>) => {
    startTransition(async () => {
      const updated = await updateCategory(id, data)
      setCats(prev => prev.map(c => c.id === id ? updated : c))
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCategory(id)
      setCats(prev => prev.filter(c => c.id !== id))
    })
  }

  return (
    <div className="space-y-3">
      {cats.map(cat => (
        <CategoryRow key={cat.id} cat={cat} onSave={handleSave} onDelete={handleDelete} />
      ))}

      {showNew ? (
        <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--surface2)', border: '1px solid rgba(200,167,86,0.35)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase tracking-widest mb-1 block" style={{ color: 'var(--text-faint)' }}>Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="e.g. Stocks"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-widest mb-1 block" style={{ color: 'var(--text-faint)' }}>Description</label>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Brief description"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-2 block" style={{ color: 'var(--text-faint)' }}>Color</label>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-black text-xs font-semibold rounded-lg">
              <Plus size={12} /> Create
            </button>
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-dashed border-2 text-sm transition-colors hover:border-accent/50 hover:text-accent"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          <Plus size={15} /> Add Category
        </button>
      )}
    </div>
  )
}
