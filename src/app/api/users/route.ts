import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError, parsePagination } from '@/lib/api/response'
import { computeStatsForUsers } from '@/lib/api/user-stats'
import { z } from 'zod'
import { userSchema } from '@/lib/validations/schemas'
import { signUp as helperSignUp } from '@/lib/supabase/auth'

const listQuerySchema = z.object({
  role: z.enum(['admin','driver','dispatcher']).optional(),
  is_active: z.enum(['true','false']).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  per_page: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const { searchParams } = new URL(req.url)
    const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams.entries()))
    if (!parsed.success) return jsonError('Invalid query params', 400)

    const { page, per_page, from, to } = parsePagination(searchParams)
    const supabase = createRouteHandlerClient(req)

    let query = supabase.from('users').select('*', { count: 'exact' })
    if (parsed.data.role) query = query.eq('role', parsed.data.role)
    if (parsed.data.is_active) query = query.eq('is_active', parsed.data.is_active === 'true')
    if (parsed.data.search) {
      const s = parsed.data.search.replace(/%/g, '')
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
    }
    query = query.order('full_name', { ascending: true }).range(from, to)

    const { data: users, error: fetchErr, count } = await query
    if (fetchErr) return jsonError(fetchErr.message, 400)

    const ids = (users ?? []).map((u) => u.id)
    const statsMap = ids.length ? await computeStatsForUsers(ids, req) : new Map()

    const enriched = (users ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      role: u.role,
      avatar_url: u.avatar_url,
      is_active: u.is_active,
      created_at: u.created_at,
      updated_at: u.updated_at,
      ...((statsMap.get(u.id) ?? {}) as any),
    }))

    const total = count ?? 0
    const total_pages = Math.max(1, Math.ceil(total / per_page))
    return NextResponse.json({ success: true, data: enriched, pagination: { total, page, per_page, total_pages } })
  } catch (e: any) {
    return jsonError('Failed to list users', 500)
  }
}

const adminCreateSchema = userSchema.extend({
  password: z.string().min(8),
  role: z.enum(['admin','driver','dispatcher']),
})

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const body = await req.json()
    const parsed = adminCreateSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const { email, password, full_name, phone, role } = parsed.data as any

    // Sign up in Auth
    const { data, error: authErr } = await (async () => helperSignUp(email, password, full_name, phone))()
    if (authErr) return jsonError(authErr, 400)

    const supabase = createRouteHandlerClient(req)
    // Update role to requested one (may differ from default driver)
    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update({ role })
      .eq('id', data!.id)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    return jsonOk({
      id: updated.id,
      email: updated.email,
      full_name: updated.full_name,
      phone: updated.phone,
      role: updated.role,
      avatar_url: updated.avatar_url,
      is_active: updated.is_active,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    }, 'User created')
  } catch (e: any) {
    return jsonError('Failed to create user', 500)
  }
}
