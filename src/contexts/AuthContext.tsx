"use client"

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp, getCurrentUser, updateUserProfile } from '@/lib/supabase/auth'
import type { User, UpdateInput } from '@/types'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase/browser'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isDriver: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, full_name: string, phone?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: UpdateInput<User>) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const firstLoad = useRef(true)

  const refreshUser = useCallback(async () => {
    // Only show the global loading spinner during the initial resolve.
    if (firstLoad.current) setLoading(true)
    try {
      const sb = createBrowserClient()
      // If no client-side session, consider signed-out
      const { data: sess } = await sb.auth.getSession()
      if (!sess.session) { setUser(null); return }

      // Try reading profile via client helper first (bounded timeout)
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
      let u = await Promise.race([getCurrentUser(), timeout])

      // Fallback: call server API profile (uses Bearer token or cookies) if needed
      if (!u) {
        try {
          const ctrl = new AbortController()
          const t = setTimeout(() => ctrl.abort(), 4000)
          const token = sess.session?.access_token
          const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
          const res = await fetch('/api/profile', { credentials: 'include', signal: ctrl.signal, headers })
          clearTimeout(t)
          if (res.ok) {
            const json = await res.json()
            u = (json && json.data) ? json.data.user ?? json.data : json
          }
        } catch {}
      }

      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
      firstLoad.current = false
    }
  }, [])

  useEffect(() => {
    // initial fetch
    refreshUser()

    // subscribe to auth changes on client (do not toggle the global spinner again)
    const sb = createBrowserClient()
    const { data: sub } = sb.auth.onAuthStateChange(async () => {
      await refreshUser()
    })
    return () => {
      try { sub.subscription.unsubscribe() } catch {}
    }
  }, [refreshUser])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await authSignIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    setUser(data!)
    toast.success('Signed in')
    // Redirect by role
    if (data?.role === 'admin') router.replace('/admin')
    else router.replace('/driver')
  }, [router])

  const signUp = useCallback(async (email: string, password: string, full_name: string, phone?: string) => {
    setLoading(true)
    const { data, error } = await authSignUp(email, password, full_name, phone)
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    setUser(data!)
    toast.success('Account created')
    if (data?.role === 'admin') router.replace('/admin')
    else router.replace('/driver')
  }, [router])

  const signOut = useCallback(async () => {
    setLoading(true)
    const { error } = await authSignOut()
    setLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    setUser(null)
    router.replace('/login')
  }, [router])

  const updateProfile = useCallback(async (data: UpdateInput<User>) => {
    if (!user) return
    setLoading(true)
    const res = await updateUserProfile(user.id, data)
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    setUser(res.data!)
    toast.success('Profile updated')
  }, [user])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    signIn,
    signUp,
    signOut,
    updateProfile,
  }), [loading, signIn, signOut, signUp, updateProfile, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
