import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const supabase = createRouteHandlerClient(req)

    const { data: original, error: getErr } = await supabase.from('orders').select('*').eq('id', id).single()
    if (getErr && getErr.code === 'PGRST116') return jsonError('Order not found', 404)
    if (getErr) return jsonError(getErr.message, 400)

    const { id: _omit, order_number: _num, created_at: _ca, updated_at: _ua, status: _st, status_reason: _sr, is_dispatched: _d1, is_loaded: _d2, is_notified: _d3, is_delayed: _d4, is_cancelled: _d5, is_delivered: _d6, is_locked: _lock, ...rest } = original as any

    const payload = {
      ...rest,
      status: 'dispatched' as const,
      status_reason: null,
      is_dispatched: false,
      is_loaded: false,
      is_notified: false,
      is_delayed: false,
      is_cancelled: false,
      is_delivered: false,
      is_locked: false,
      created_by: user!.id,
    }

    const { data: created, error: insErr } = await supabase
      .from('orders')
      .insert(payload)
      .select('*')
      .single()

    if (insErr) return jsonError(insErr.message, 400)

    return jsonOk(created, 'Order duplicated')
  } catch (e: any) {
    return jsonError('Failed to duplicate order', 500)
  }
}
