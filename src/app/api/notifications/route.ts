import { NextRequest } from 'next/server'
import { requireAuth, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const { searchParams } = new URL(req.url)
    const is_read_param = searchParams.get('is_read') // 'true' | 'false' | 'all'
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') ?? 50)))

    const supabase = createRouteHandlerClient(req)
    let query = supabase
      .from('notifications')
      .select('*, order:orders!notifications_order_id_fkey(id,order_number,status,date,driver_name,customer_name)')
      .eq('user_id', current.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (is_read_param === 'true') query = query.eq('is_read', true)
    else if (is_read_param === 'false') query = query.eq('is_read', false)

    const { data, error } = await query
    if (error) return jsonError(error.message, 400)

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', current.id)
      .eq('is_read', false)

    return jsonOk({ notifications: data ?? [], unread_count: unreadCount ?? 0 })
  } catch (e: any) {
    return jsonError('Failed to fetch notifications', 500)
  }
}

const createSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['order_assigned','status_changed','order_created','order_delayed']),
  order_id: z.string().uuid().optional(),
})

// Internal use; assume only authenticated callers (could restrict further to admin)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const supabase = createRouteHandlerClient(req)
    const { data, error } = await (supabase as any).from('notifications').insert(parsed.data).select('*').single()
    if (error) return jsonError(error.message, 400)

    return jsonOk(data, 'Notification created')
  } catch (e: any) {
    return jsonError('Failed to create notification', 500)
  }
}
