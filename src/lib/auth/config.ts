import type { NextAuthConfig } from 'next-auth'

// This file has NO Node.js imports — safe for the Edge runtime (middleware).
// The full auth.ts adds the Credentials provider with DB access.

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      if (pathname.startsWith('/admin')) return !!auth
      if (pathname === '/login' && !!auth) {
        return Response.redirect(new URL('/admin', request.nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
} satisfies NextAuthConfig

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name: string }
  }
}
