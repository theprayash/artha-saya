'use server'

import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { signOut } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function createFirstAdmin(formData: FormData): Promise<{ error?: string }> {
  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1)
  if (existing.length > 0) {
    return { error: 'An admin account already exists. Please log in.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').toLowerCase().trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirm') ?? '')

  if (!name || !email || !password) return { error: 'All fields are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Invalid email address.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.insert(adminUsers).values({ name, email, passwordHash })

  redirect('/login?setup=done')
}

export async function logOut() {
  await signOut({ redirectTo: '/login' })
}
