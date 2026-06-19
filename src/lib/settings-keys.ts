export const SETTING_KEYS = [
  'site_name',
  'site_tagline',
  'contact_email',
  'author_name',
  'author_bio',
  'newsletter_headline',
  'newsletter_subtext',
] as const

export type SettingKey = typeof SETTING_KEYS[number]

export const SETTING_DEFAULTS: Record<SettingKey, string> = {
  site_name: 'Artha Saya',
  site_tagline: 'Share market insights explained simply.',
  contact_email: '',
  author_name: '',
  author_bio: '',
  newsletter_headline: 'Market insights in your inbox',
  newsletter_subtext: 'Weekly round-up — top movers, IPO alerts, and commentary. Free, always.',
}
