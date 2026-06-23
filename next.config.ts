import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep pg and bcryptjs out of the browser/edge bundle — Node.js only
  serverExternalPackages: ['pg', 'pg-pool', 'bcryptjs'],

  webpack(config) {
    // Suppress the optional pg-native warning
    config.resolve.fallback = { ...config.resolve.fallback, 'pg-native': false }
    return config
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

export default nextConfig
