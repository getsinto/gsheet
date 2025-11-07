import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'

const bodySchema = z.object({
  checkbox_name: z.enum([
    'is_dispatched',
    'is_loaded',
    'is_notified',
    'is_delayed',
    'is_cancelled',
    'is_delivered',
  ] as const),
  checkbox_value: z.boolean(),
  status_reason: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    // Load order and permission check
    const { data: order, error: getErr } = await supabase.from('orders').select('*').eq('id', id).single()
    if (getErr && getErr.code === 'PGRST116') return jsonError('Order not found', 404)
    if (getErr) return jsonError(getErr.message, 400)

    const isAssignedDriver = order.driver_id === current.id
    const isAdmin = current.role === 'admin'
    if (!isAdmin && !isAssignedDriver) return jsonError('Forbidden', 403)

    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const { checkbox_name, checkbox_value, status_reason } = parsed.data

    const updates: Record<string, any> = { [checkbox_name]: checkbox_value }

    // Determine overall status and lock rules
    if (checkbox_name === 'is_delivered' && checkbox_value) {
      updates.status = 'delivered'
      updates.is_locked = true
    } else if (checkbox_name === 'is_cancelled' && checkbox_value) {
      updates.status = 'cancelled'
    } else if (checkbox_name === 'is_delayed' && checkbox_value) {
      updates.status = 'delayed'
    } else if (checkbox_name === 'is_loaded' && checkbox_value) {
      updates.status = 'loaded'
    } else if (checkbox_name === 'is_dispatched' && checkbox_value) {
      updates.status = 'dispatched'
    }

    if ((updates.status === 'delayed' || updates.status === 'cancelled') && !status_reason) {
      return jsonError('status_reason is required for delayed/cancelled', 400)
    }
    if (status_reason) updates.status_reason = status_reason

    const { data: updated, error: updErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', params.id)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    return jsonOk(updated, 'Status updated')
  } catch (e: any) {
    return jsonError('Failed to update status', 500)
  }
}
