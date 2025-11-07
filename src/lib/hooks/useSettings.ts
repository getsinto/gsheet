import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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
  const json = await res.json()
  // Unwrap our API envelope if present
  return typeof json === 'object' && json && 'success' in json ? (json.data ?? null) : json
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: ()=>fetchJSON('/api/settings'),
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (partial: Record<string, any>)=> fetchJSON('/api/settings', {
      method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(partial)
    }),
    onSuccess: ()=>{ qc.invalidateQueries({ queryKey:['settings'] }) },
  })
}

export function useRotateWeek() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ()=> fetchJSON('/api/settings/rotate-week', { method:'POST' }),
    onSuccess: ()=>{ qc.invalidateQueries({ queryKey:['settings'] }) },
  })
}
