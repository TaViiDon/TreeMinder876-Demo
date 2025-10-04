// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/hooks/useSession'
import SupplierDashboard from './components/features/Dashboard/SupplierDashboard'
import CustodianDashboard from './components/features/Dashboard/CustodianDashboard'

export default function Home() {
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (user.role === 'SUPPLIER') return <SupplierDashboard />
  if (user.role === 'CUSTODIAN') return <CustodianDashboard />

  return <div>Unauthorized role</div>
}