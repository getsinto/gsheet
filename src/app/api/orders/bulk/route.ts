import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'
import { cloudinary } from '@/lib/cloudinary'

const deleteSchema = z.object({ order_ids: z.array(z.string().uuid()).min(1) })
const updateStatusSchema = z.object({
  order_ids: z.array(z.string().uuid()).min(1),
  status: z.enum(['dispatched','loaded','notified','delayed','cancelled','delivered']),
  status_reason: z.string().optional(),
})
const assignDriverSchema = z.object({
  order_ids: z.array(z.string().uuid()).min(1),
  driver_id: z.string().uuid(),
  driver_name: z.string().min(2),
})

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const supabase = createRouteHandlerClient(req)

    if (action === 'delete') {
      const body = await req.json()
      const parsed = deleteSchema.safeParse(body)
      if (!parsed.success) return jsonError('Invalid order_ids', 400)

      // Collect public_ids
      const { data: photos } = await supabase
        .from('order_photos')
        .select('public_id, order_id')
        .in('order_id', parsed.data.order_ids)

      const publicIds = (photos ?? []).map((p) => p.public_id).filter(Boolean)
      const { error: delErr } = await supabase.from('orders').delete().in('id', parsed.data.order_ids)
      if (delErr) return jsonError(delErr.message, 400)

      if (publicIds.length > 0) {
        try { await cloudinary.api.delete_resources(publicIds) } catch (e) { console.error(e) }
      }

      return jsonOk({ count: parsed.data.order_ids.length }, 'Orders deleted')
    }

    if (action === 'update-status') {
      const body = await req.json()
      const parsed = updateStatusSchema.safeParse(body)
      if (!parsed.success) return jsonError('Invalid payload', 400)

      const updates: any = { status: parsed.data.status }
      if (parsed.data.status === 'delivered') updates.is_locked = true
      if (parsed.data.status === 'delayed') updates.is_delayed = true
      if (parsed.data.status === 'cancelled') updates.is_cancelled = true
      if (parsed.data.status === 'loaded') updates.is_loaded = true
      if (parsed.data.status === 'dispatched') updates.is_dispatched = true
      if (parsed.data.status_reason) updates.status_reason = parsed.data.status_reason

      const { error: updErr } = await supabase
        .from('orders')
        .update(updates)
        .in('id', parsed.data.order_ids)
      if (updErr) return jsonError(updErr.message, 400)

      return jsonOk({ count: parsed.data.order_ids.length }, 'Orders updated')
    }

    if (action === 'assign-driver') {
      const body = await req.json()
      const parsed = assignDriverSchema.safeParse(body)
      if (!parsed.success) return jsonError('Invalid payload', 400)

      const { error: updErr } = await supabase
        .from('orders')
        .update({ driver_id: parsed.data.driver_id, driver_name: parsed.data.driver_name })
        .in('id', parsed.data.order_ids)
      if (updErr) return jsonError(updErr.message, 400)

      return jsonOk({ count: parsed.data.order_ids.length }, 'Driver assigned')
    }

    return jsonError('Unknown bulk action', 400)
  } catch (e: any) {
    return jsonError('Failed to process bulk action', 500)
  }
}
