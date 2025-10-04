// src/lib/auth.ts
import { NextAuthOptions, User as NextAuthUser, AdapterUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Extend NextAuth User and AdapterUser types to include 'role' and 'profileImage'
declare module 'next-auth' {
  interface User {
    role?: string;
    profileImage?: string | null;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      profileImage?: string | null;
      email?: string | null;
      name?: string | null;
    };
  }
}

declare module 'next-auth' {
  interface AdapterUser {
    role?: string;
    profileImage?: string | null;
  }
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          return null;
        }

        // Verify password - make sure your user passwords are hashed with bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Return user object (this will be stored in JWT token)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileImage: user.profileImage
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user role and info to the token on sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          profileImage: user.profileImage
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from token to session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          profileImage: token.profileImage as string | null
        }
      };
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-for-dev'
};