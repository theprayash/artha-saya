import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './config'
import { db } from '@/lib/db'
import { adminUsers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).toLowerCase().trim()
        const password = String(credentials.password)

        const user = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, email),
        })

        const dummyHash = '$2a$12$dummyhashtopreventtimingattacks00000000000000000000000'
        const isValid = user
          ? await bcrypt.compare(password, user.passwordHash)
          : await bcrypt.compare(password, dummyHash).then(() => false)

        if (!user || !isValid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
})
