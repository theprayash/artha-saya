'use server'

import { db } from '@/lib/db'
import { newsletterSubscribers } from '@/lib/db/schema'

export async function subscribe(email: string): Promise<{ success?: true; error?: string }> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { error: 'Please enter a valid email address.' }
  }

  try {
    await db.insert(newsletterSubscribers).values({ email: trimmed }).onConflictDoNothing()
    return { success: true }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}
