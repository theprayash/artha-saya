'use server'

import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function createCategory(data: { name: string; color: string; description: string }) {
  const slug = toSlug(data.name)
  const [cat] = await db.insert(categories).values({ ...data, slug }).returning()
  revalidatePath('/admin/categories')
  return cat
}

export async function updateCategory(
  id: string,
  data: { name?: string; color?: string; description?: string },
) {
  const [cat] = await db.update(categories).set(data).where(eq(categories.id, id)).returning()
  revalidatePath('/admin/categories')
  return cat
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath('/admin/categories')
}
