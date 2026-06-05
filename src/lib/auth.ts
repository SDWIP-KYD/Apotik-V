import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import authConfig from '@/lib/auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'DOCTOR' | 'STAFF'
    }
  }

  interface User {
    role: 'DOCTOR' | 'STAFF'
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role as 'DOCTOR' | 'STAFF'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
})
