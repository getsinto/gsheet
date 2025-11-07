import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/lib/hooks/useAuth"

import { createBrowserClient } from "@/lib/supabase/browser"

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const sb = createBrowserClient()
    const { data } = await sb.auth.getSession()
    const token = data.session?.access_token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch { return {} }
}

async function fetchJSON(path: string, init?: RequestInit) {
  const headers = { ...(await authHeaders()), ...(init?.headers as Record<string,string> | undefined) }
  const res = await fetch(path, { credentials: 'include', ...init, headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useDriverOrders({ status, week }: { status?: string; week?: 'this'|'next' }) {
  const { user } = useAuth()
  const q = new URLSearchParams()
  if (user?.id) q.set('driver_id', user.id)
  if (status) q.set('status', status)
  if (week) q.set('week', week)
  return useQuery({
    queryKey: ['driver-orders', user?.id, status, week],
    queryFn: ()=> fetchJSON(`/api/orders?${q.toString()}`),
    select: (r:any)=> r?.data ?? r, // support either {data} or array
    refetchInterval: 30_000,
    enabled: !!user?.id,
  })
}

export function useDriverOrderById(id: string) {
  return useQuery({
    queryKey: ['driver-order', id],
    queryFn: ()=> fetchJSON(`/api/orders/${id}`),
    select: (r:any)=> r?.data ?? r,
    enabled: !!id,
  })
}

export function useDriverStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['driver-stats', user?.id],
    queryFn: ()=> fetchJSON(`/api/users/${user?.id}/stats`),
    select: (r:any)=> r?.data ?? r,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTodayOrders() {
  const { user } = useAuth()
  const today = new Date().toISOString().slice(0,10)
  const q = new URLSearchParams()
  if (user?.id) q.set('driver_id', user.id)
  q.set('date', today)
  return useQuery({
    queryKey: ['driver-orders-today', user?.id, today],
    queryFn: ()=> fetchJSON(`/api/orders?${q.toString()}`),
    select: (r:any)=> r?.data ?? r,
    refetchInterval: 15_000,
    enabled: !!user?.id,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string })=> fetchJSON(`/api/orders/${id}/status`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ status }) }),
    onSuccess: (_d, vars)=>{
      qc.invalidateQueries({ queryKey:['driver-orders'] })
      qc.invalidateQueries({ queryKey:['driver-order', vars.id] })
      qc.invalidateQueries({ queryKey:['driver-stats'] })
    }
  })
}

export function useOrderPhotos(orderId: string) {
  return useQuery({
    queryKey: ['order-photos', orderId],
    queryFn: ()=> fetchJSON(`/api/orders/${orderId}/photos`),
    select: (r:any)=> r?.data ?? r,
    enabled: !!orderId,
  })
}

export function useUploadPhoto(orderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File)=>{
      const fd = new FormData(); fd.append('file', file)
      return fetchJSON(`/api/orders/${orderId}/photos`, { method:'POST', body: fd })
    },
    onSuccess: ()=>{ qc.invalidateQueries({ queryKey:['order-photos', orderId] }) },
  })
}

export function useDeletePhoto(orderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ photoId }: { photoId: string })=> fetchJSON(`/api/orders/${orderId}/photos/${photoId}`, { method:'DELETE' }),
    onSuccess: ()=>{ qc.invalidateQueries({ queryKey:['order-photos', orderId] }) },
  })
}

export function useOrderComments(orderId: string) {
  return useQuery({
    queryKey: ['order-comments', orderId],
    queryFn: ()=> fetchJSON(`/api/orders/${orderId}/comments`),
    select: (r:any)=> r?.data ?? r,
    enabled: !!orderId,
  })
}

export function useAddOrderComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string })=> fetchJSON(`/api/orders/${id}/comments`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ content }) }) ,
    onSuccess: (_d, v)=>{ qc.invalidateQueries({ queryKey:['order-comments', v.id] }) },
  })
}

export function useDriverNotifications() {
  const { user } = useAuth()
  const q = useQuery({
    queryKey: ['driver-notifications', user?.id],
    queryFn: ()=> fetchJSON('/api/notifications'),
    refetchInterval: 30_000,
    enabled: !!user?.id,
  })
  const markAllRead = async ()=>{ try { await fetch('/api/notifications/mark-all-read', { method:'PATCH' }) } finally { q.refetch() } }
  return { ...q, markAllRead }
}
