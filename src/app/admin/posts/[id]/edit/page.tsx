import { db } from '@/lib/db'
import { posts, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import PostEditor from '../../_components/PostEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params

  const [post, cats] = await Promise.all([
    db.query.posts.findFirst({ where: eq(posts.id, id) }),
    db.select().from(categories),
  ])

  if (!post) notFound()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>Edit Article</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Last updated {post.updatedAt.toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <PostEditor post={post} categories={cats} />
    </div>
  )
}
