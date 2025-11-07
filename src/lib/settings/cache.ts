import { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export type AppSettingsMap = Record<string, any>

let CACHE: { settings: AppSettingsMap | null; loadedAt: number | null } = {
  settings: null,
  loadedAt: null,
}

const TTL_MS = 60_000 // 1 minute in-memory cache (adjust as needed)

function getClient(req?: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return req?.cookies.get(name)?.value
      },
      set(_name: string, _value: string, _options?: CookieOptions) {},
      remove(_name: string, _options?: CookieOptions) {},
    },
  })
}

export async function loadSettings(force = false, req?: NextRequest): Promise<AppSettingsMap> {
  if (!force && CACHE.settings && CACHE.loadedAt && Date.now() - CACHE.loadedAt < TTL_MS) {
    return CACHE.settings
  }
  const supabase = getClient(req)
  const { data, error } = await supabase.from('app_settings').select('key,value')
  if (error) throw new Error(error.message)
  const map: AppSettingsMap = {}
  for (const row of data ?? []) map[row.key] = row.value
  CACHE = { settings: map, loadedAt: Date.now() }
  return map
}

export async function refreshSettingsCache(req?: NextRequest) {
  await loadSettings(true, req)
}

export async function getSettingsObject(req?: NextRequest): Promise<{
  company_name?: string
  default_pay_rate?: number
  current_week?: 1 | 2
  container_types?: string[]
  markets?: string[]
  podium_message_template?: string
  auto_lock_delivered?: boolean
  week_start_day?: string
}> {
  const s = await loadSettings(false, req)
  return {
    company_name: s.company_name ?? undefined,
    default_pay_rate: typeof s.default_pay_rate === 'number' ? s.default_pay_rate : (s.default_pay_rate ? Number(s.default_pay_rate) : undefined),
    current_week: s.current_week as 1 | 2 | undefined,
    container_types: (s.container_types as string[]) ?? undefined,
    markets: (s.markets as string[]) ?? undefined,
    podium_message_template: s.podium_message_template ?? undefined,
    auto_lock_delivered: typeof s.auto_lock_delivered === 'boolean' ? s.auto_lock_delivered : undefined,
    week_start_day: s.week_start_day ?? undefined,
  }
}

export async function updateSetting(key: string, value: any, userId: string, req?: NextRequest) {
  const supabase = getClient(req)
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_by: userId, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
  await refreshSettingsCache(req)
}

export async function getContainerTypes(req?: NextRequest): Promise<string[]> {
  const s = await loadSettings(false, req)
  return (s.container_types as string[]) ?? []
}

export async function getMarkets(req?: NextRequest): Promise<string[]> {
  const s = await loadSettings(false, req)
  return (s.markets as string[]) ?? []
}

export async function getPodiumMessageTemplate(req?: NextRequest): Promise<string> {
  const s = await loadSettings(false, req)
  return (s.podium_message_template as string) ?? 'Order #[order_number] is now [status].'
}
