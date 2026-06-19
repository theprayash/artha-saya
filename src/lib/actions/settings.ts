'use server'

import { db } from '@/lib/db'
import { siteSettings } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { SETTING_KEYS, SETTING_DEFAULTS } from '@/lib/settings-keys'
import type { SettingKey } from '@/lib/settings-keys'

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await db.select().from(siteSettings)
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
  const result = {} as Record<SettingKey, string>
  for (const key of SETTING_KEYS) {
    result[key] = (map[key] ?? SETTING_DEFAULTS[key]) as string
  }
  return result
}

export async function saveSetting(key: SettingKey, value: string) {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
  revalidatePath('/admin/settings')
  revalidatePath('/')
}

export async function saveSettings(data: Partial<Record<SettingKey, string>>) {
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      db
        .insert(siteSettings)
        .values({ key, value: value ?? '', updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: value ?? '', updatedAt: new Date() } })
    )
  )
  revalidatePath('/admin/settings')
  revalidatePath('/')
}
