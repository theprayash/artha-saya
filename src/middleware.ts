import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

// Only imports authConfig — no pg, no bcryptjs, fully Edge-compatible.
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
