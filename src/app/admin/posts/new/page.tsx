import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import PostEditor from '../_components/PostEditor'

export default async function NewPostPage() {
  const cats = await db.select().from(categories)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>New Article</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Write and publish a new article.</p>
      </div>
      <PostEditor categories={cats} />
    </div>
  )
}
