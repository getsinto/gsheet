"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/browser"

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const sb = createBrowserClient()
    const { data } = await sb.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch { return {} }
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = { ...(await authHeaders()), ...(init?.headers as Record<string,string> | undefined) }
  const res = await fetch(url, { credentials: "include", ...init, headers })
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return (json && typeof json === 'object' && 'success' in json) ? (json.data as T) : (json as T)
}

export function useOrders(params: URLSearchParams) {
  const key = ["orders", params.toString()]
  const url = `/api/orders?${params.toString()}`
  return useQuery({ queryKey: key, queryFn: () => fetchJSON<any>(url), refetchInterval: 30_000 })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, checkbox_name, checkbox_value }: { id: string; checkbox_name: string; checkbox_value: boolean }) => {
      const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' }
      const res = await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers, body: JSON.stringify({ checkbox_name, checkbox_value }) })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const headers = await authHeaders()
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const headers = { ...(await authHeaders()), 'Content-Type': 'application/json' }
      const res = await fetch(`/api/orders`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  })
}
