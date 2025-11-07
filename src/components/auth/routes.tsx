"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  // Optimistically render children during loading so pages can mount and fetch.
  if (!loading && !user) return null
  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  // Do not block UI while loading; allow pages to mount and fetch.
  if (!loading && !user) return null
  if (!loading && !isAdmin) return <div className="p-6">403 – Forbidden</div>
  return <>{children}</>
}

export function DriverRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isDriver } = useAuth()
  // Do not block UI while loading; allow pages to mount and fetch.
  if (!loading && !user) return null
  if (!loading && !isDriver) return <div className="p-6">403 – Forbidden</div>
  return <>{children}</>
}
