import NextAuth from 'next-auth'
import { prisma } from '@/lib/prisma'
import authConfig from '@/lib/auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'DOCTOR' | 'STAFF'
      image?: string | null
    }
  }

  interface User {
    role: 'DOCTOR' | 'STAFF'
    image?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.image = (user as any).image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'DOCTOR' | 'STAFF'
        session.user.image = token.image as string | null | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
})
