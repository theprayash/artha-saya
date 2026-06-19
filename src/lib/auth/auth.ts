import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './config'
import { db } from '@/lib/db'
import { adminUsers, otpTokens } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// Full auth — includes DB-dependent Credentials provider.
// Only imported in server components and API routes, never in middleware.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'One-time code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null

        const email = String(credentials.email).toLowerCase().trim()
        const otp = String(credentials.otp).trim()

        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, email),
        })
        if (!user) return null

        // Find the most recent valid (unused, unexpired) token for this user
        const token = await db.query.otpTokens.findFirst({
          where: and(
            eq(otpTokens.adminUserId, user.id),
            eq(otpTokens.used, false),
            gt(otpTokens.expiresAt, new Date()),
          ),
          orderBy: (t, { desc }) => [desc(t.createdAt)],
        })
        if (!token) return null

        const valid = await bcrypt.compare(otp, token.tokenHash)
        if (!valid) return null

        // Mark token as used — single use
        await db.update(otpTokens).set({ used: true }).where(eq(otpTokens.id, token.id))

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
})
