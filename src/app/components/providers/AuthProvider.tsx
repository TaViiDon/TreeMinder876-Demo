'use client'

import React, { createContext, useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { useSession as useNextAuthSession } from 'next-auth/react'
import type { User } from '@/lib/types'

type AuthContextValue = {
  user: User | null
  setUser: (u: User | null) => void
}

export const AuthContext = createContext<AuthContextValue>({ user: null, setUser: () => {} })

function InnerAuthProvider({ children }: { children: React.ReactNode }) {
  // sync next-auth session to a simple user state for backward compatibility
  const { data: session } = useNextAuthSession()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (session?.user) {
      // Properly map NextAuth user to your User type
      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user as any).role || 'CUSTODIAN',
        profileImage: (session.user as any).profileImage || null
      }
      setUser(userData)
    } else {
      setUser(null)
    }
  }, [session])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  )
}