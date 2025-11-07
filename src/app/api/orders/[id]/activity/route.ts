import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError, jsonCreated } from '@/lib/api/response'
import { z } from 'zod'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    // Permission: admin or assigned driver
    const { data: order, error: ordErr } = await supabase.from('orders').select('driver_id').eq('id', id).single()
    if (ordErr && ordErr.code === 'PGRST116') return jsonError('Order not found', 404)
    if (ordErr) return jsonError(ordErr.message, 400)
    if (current.role !== 'admin' && (order as any).driver_id !== current.id) return jsonError('Forbidden', 403)

    const { data, error } = await supabase
      .from('order_activity_log')
      .select('id,order_id,user_id,user_name,action,details,created_at, user:users!order_activity_log_user_id_fkey(id,full_name,avatar_url)')
      .eq('order_id', id)
      .order('created_at', { ascending: false })

    if (error) return jsonError(error.message, 400)
    return jsonOk(data ?? [])
  } catch (e: any) {
    return jsonError('Failed to fetch activity', 500)
  }
}

const postSchema = z.object({
  action: z.enum(['created','updated','deleted','status_changed','assigned']),
  details: z.record(z.string(), z.any()).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const body = await req.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const { data, error } = await (supabase as any)
      .from('order_activity_log')
      .insert({ order_id: id, user_id: current.id, user_name: current.full_name, action: parsed.data.action, details: parsed.data.details ?? {} })
      .select('*')
      .single()

    if (error) return jsonError(error.message, 400)
    return jsonCreated(data, 'Activity logged')
  } catch (e: any) {
    return jsonError('Failed to log activity', 500)
  }
}
