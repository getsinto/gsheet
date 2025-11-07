import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export type DriversQuery = {
  search?: string
  status?: 'all'|'active'|'inactive'
  sort?: 'name_asc'|'name_desc'|'orders'|'recent'
  page?: number
  per_page?: number
}

import { createBrowserClient } from "@/lib/supabase/browser"

async function authHeaders(): Promise<Record<string,string>> {
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

export function useDrivers(params: DriversQuery) {
  const query = new URLSearchParams()
  query.set('role','driver')
  if (params.search) query.set('search', params.search)
  if (params.status && params.status!=='all') query.set('is_active', String(params.status==='active'))
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  // server-side sort may not exist; we can still request and sort client-side
  if (params.sort) query.set('sort', params.sort)

  return useQuery({
    queryKey: ['drivers', Object.fromEntries(query)],
    queryFn: ()=>fetchJSON(`/api/users?${query.toString()}`),
    staleTime: 10_000,
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: ()=>fetchJSON(`/api/users/${id}`),
    enabled: !!id,
  })
}

export function useDriverStats(id: string) {
  return useQuery({
    queryKey: ['driver-stats', id],
    queryFn: ()=>fetchJSON(`/api/users/${id}/stats`),
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { full_name?: string; name?: string; email: string; phone?: string; role: 'driver'|'dispatcher'|'admin'; password: string; is_active?: boolean })=>{
      const body: any = { ...payload, full_name: payload.full_name ?? payload.name }
      delete body.name
      return fetchJSON('/api/users', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
    },
    onSuccess: ()=>{ qc.invalidateQueries({ queryKey:['drivers'] }) },
  })
}

export function useUpdateDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> })=>{
      return fetchJSON(`/api/users/${id}`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(updates) })
    },
    onSuccess: (_data, vars)=>{
      qc.invalidateQueries({ queryKey:['drivers'] })
      qc.invalidateQueries({ queryKey:['driver', vars.id] })
    },
  })
}

export function useDeleteDriver() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string })=> fetchJSON(`/api/users/${id}`, { method:'DELETE' }),
    onSuccess: ()=>{ qc.invalidateQueries({ queryKey:['drivers'] }) },
  })
}

export function useToggleDriverStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean })=> fetchJSON(`/api/users/${id}/toggle-active`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ is_active: active }) }),
    onSuccess: (_d,_v)=>{ qc.invalidateQueries({ queryKey:['drivers'] }) },
  })
}

export function useChangeDriverRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'driver'|'dispatcher'|'admin' })=> fetchJSON(`/api/users/${id}/role`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ role }) }),
    onSuccess: (_d, vars)=>{
      qc.invalidateQueries({ queryKey:['drivers'] })
      qc.invalidateQueries({ queryKey:['driver', vars.id] })
    }
  })
}

export function useDriverPerformance({ range = 'week' as 'week'|'month'|'quarter' }) {
  const query = new URLSearchParams()
  query.set('range', range)
  return useQuery({
    queryKey: ['driver-performance', range],
    queryFn: ()=>fetchJSON(`/api/drivers/performance?${query.toString()}`),
    staleTime: 10_000,
  })
}
