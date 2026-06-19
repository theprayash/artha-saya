import { db } from '@/lib/db'
import { categories } from '@/lib/db/schema'
import CategoriesManager from './_components/CategoriesManager'

export default async function AdminCategoriesPage() {
  const cats = await db.select().from(categories)
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>Categories</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage article categories. {cats.length} total.
        </p>
      </div>
      <CategoriesManager categories={cats} />
    </div>
  )
}
