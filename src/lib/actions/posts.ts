'use server'

import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function createPost(data: {
  title: string
  excerpt: string
  category: string
  content: string
  published: boolean
}) {
  const slug = toSlug(data.title) + '-' + Date.now().toString(36)
  const [post] = await db.insert(posts).values({ ...data, slug }).returning()
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  return post
}

export async function updatePost(
  id: string,
  data: {
    title?: string
    excerpt?: string
    category?: string
    content?: string
    published?: boolean
  },
) {
  const [post] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning()
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  return post
}

export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id))
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
}

export async function togglePublish(id: string, published: boolean) {
  await db.update(posts).set({ published, updatedAt: new Date() }).where(eq(posts.id, id))
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
}

export async function togglePin(id: string, pinned: boolean) {
  await db.update(posts).set({ pinned, updatedAt: new Date() }).where(eq(posts.id, id))
  revalidatePath('/admin/posts')
  revalidatePath('/')
  revalidatePath('/blog')
}

export async function incrementViewCount(id: string) {
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, id))
}
