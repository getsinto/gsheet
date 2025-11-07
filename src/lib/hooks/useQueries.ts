"use client"

import { useQuery } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/browser"

async function fetchJSON<T>(url: string): Promise<T> {
  const headers: Record<string, string> = {}
  try {
    const sb = createBrowserClient()
    const { data: sess } = await sb.auth.getSession()
    const token = sess.session?.access_token
    if (token) headers["Authorization"] = `Bearer ${token}`
  } catch {}

  const res = await fetch(url, { credentials: "include", headers })
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return (json && typeof json === 'object' && 'success' in json) ? (json.data as T) : (json as T)
}

export function useDashboardStats(weekNumber?: 1 | 2) {
  const q = new URLSearchParams()
  if (weekNumber) q.set("week_number", String(weekNumber))
  const key = ["dashboard","stats", weekNumber]
  return useQuery({
    queryKey: key,
    queryFn: () => fetchJSON<any>(`/api/dashboard/stats${q.toString() ? `?${q.toString()}` : ""}`),
    refetchInterval: 30_000,
    staleTime: 5 * 60_000,
  })
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ["dashboard","recent-orders"],
    queryFn: () => fetchJSON<any>(`/api/dashboard/recent-orders`),
    refetchInterval: 30_000,
    staleTime: 60_000,
  })
}

export function useNotifications(limit = 5, read?: boolean) {
  const q = new URLSearchParams({ limit: String(limit) })
  if (typeof read === "boolean") q.set("is_read", String(read))
  return useQuery({
    queryKey: ["notifications", limit, read],
    queryFn: () => fetchJSON<any>(`/api/notifications?${q.toString()}`),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}
