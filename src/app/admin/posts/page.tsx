import { db } from '@/lib/db'
import { posts, categories } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import PostsTable from './_components/PostsTable'

export default async function AdminPostsPage() {
  const [allPosts, cats] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.createdAt)),
    db.select().from(categories),
  ])

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>Articles</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {allPosts.length} total · {allPosts.filter(p => p.published).length} published
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-black text-sm font-semibold rounded-lg hover:bg-[#b08838] transition-colors"
        >
          <Plus size={15} /> New Article
        </Link>
      </div>

      <PostsTable posts={allPosts} categories={cats} />
    </div>
  )
}
