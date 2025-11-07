import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'

const profileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const { data: user, error } = await supabase.from('users').select('*').eq('id', current.id).single()
    if (error) return jsonError(error.message, 400)

    const { data: orders } = await supabase
      .from('orders')
      .select('status, driver_pay, miles, date')
      .eq('driver_id', current.id)
      .order('date', { ascending: false })
      .limit(10)

    const stats = {
      total_orders: (orders ?? []).length,
      completed_orders: (orders ?? []).filter((o) => o.status === 'delivered').length,
      total_earnings: (orders ?? []).reduce((s, o) => s + Number(o.driver_pay ?? 0), 0),
      total_miles: (orders ?? []).reduce((s, o) => s + Number(o.miles ?? 0), 0),
    }

    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', current.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return jsonOk({ user, stats, notifications })
  } catch (e: any) {
    return jsonError('Failed to fetch profile', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const body = await req.json()
    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const supabase = createRouteHandlerClient(req)
    const { data: updated, error } = await supabase
      .from('users')
      .update(parsed.data)
      .eq('id', current.id)
      .select('*')
      .single()

    if (error) return jsonError(error.message, 400)

    return jsonOk(updated, 'Profile updated')
  } catch (e: any) {
    return jsonError('Failed to update profile', 500)
  }
}
