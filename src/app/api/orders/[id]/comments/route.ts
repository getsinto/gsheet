import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonCreated, jsonError } from '@/lib/api/response'
import { z } from 'zod'

const bodySchema = z.object({ comment: z.string().min(1).max(1000) })

async function ensureAccess(req: NextRequest, orderId: string, userId: string, isAdmin: boolean) {
  const supabase = createRouteHandlerClient(req)
  const { data: order, error } = await supabase.from('orders').select('driver_id').eq('id', orderId).single()
  if (error && (error as any).code === 'PGRST116') return { error: 'Order not found', status: 404 as const }
  if (error) return { error: error.message, status: 400 as const }
  if (!isAdmin && (order as any).driver_id !== userId) return { error: 'Forbidden', status: 403 as const }
  return { ok: true as const }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const access = await ensureAccess(req, id, current.id, current.role === 'admin')
    if ('error' in access) return jsonError(access.error as string, access.status)

    const supabase = createRouteHandlerClient(req)
    const { data: created, error } = await (supabase as any)
      .from('order_comments')
      .insert({
        order_id: id,
        user_id: current.id,
        user_name: current.full_name,
        comment: parsed.data.comment,
      })
      .select('*')
      .single()

    if (error) return jsonError(error.message, 400)

    // Notify admins and assigned driver
    const { data: order } = await supabase.from('orders').select('driver_id,order_number').eq('id', id).single()
    if (order) {
      const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin').eq('is_active', true)
      const adminIds = ((admins ?? []) as any[]).map((a) => a.id)
      const recipients = new Set<string>([...adminIds, (order as any).driver_id].filter(Boolean) as string[])
      for (const uid of recipients) {
        await (supabase as any).from('notifications').insert({
          user_id: uid,
          title: 'New comment on order',
          message: `Order #${order.order_number}: ${current.full_name} commented`,
          type: 'status_changed',
          order_id: id,
        })
      }
    }

    return jsonCreated(created, 'Comment added')
  } catch (e: any) {
    return jsonError('Failed to add comment', 500)
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const access = await ensureAccess(req, id, current.id, current.role === 'admin')
    if ('error' in access) return jsonError(access.error, access.status)

    const supabase = createRouteHandlerClient(req)
    const { data, error } = await supabase
      .from('order_comments')
      .select('*, user:users!order_comments_user_id_fkey(id,full_name,avatar_url,role)')
      .eq('order_id', id)
      .order('created_at', { ascending: true })

    if (error) return jsonError(error.message, 400)

    return jsonOk(data ?? [])
  } catch (e: any) {
    return jsonError('Failed to fetch comments', 500)
  }
}
