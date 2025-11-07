import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAuth, requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import type { OrderStatus } from '@/types'
import { cloudinary } from '@/lib/cloudinary'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        driver:users!orders_driver_id_fkey(id,full_name,email),
        order_photos(*),
        order_comments(*, user:users!order_comments_user_id_fkey(id,full_name,email))
      `)
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return jsonError('Order not found', 404)
    if (error) return jsonError(error.message, 400)

    if (current.role !== 'admin' && order.driver_id !== current.id) {
      return jsonError('Forbidden', 403)
    }

    return jsonOk(order)
  } catch (e: any) {
    return jsonError('Failed to fetch order', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!
    const supabase = createRouteHandlerClient(req)

    const { data: existing, error: getErr } = await supabase.from('orders').select('*').eq('id', id).single()
    if (getErr && getErr.code === 'PGRST116') return jsonError('Order not found', 404)
    if (getErr) return jsonError(getErr.message, 400)

    if (existing.is_locked) return jsonError('Order is locked and cannot be edited', 400)

    const body = await req.json()

    let updates: Record<string, any> = {}
    if (current.role === 'admin') {
      updates = body // trust validated admin UI; DB triggers will log and update timestamps
    } else {
      // Drivers: only status checkbox fields
      const allowed = ['is_dispatched', 'is_loaded', 'is_notified', 'is_delayed', 'is_cancelled', 'is_delivered']
      for (const k of allowed) if (k in body) updates[k] = body[k]
      // Prevent changes if no allowed fields present
      if (Object.keys(updates).length === 0) return jsonError('No permitted fields to update', 400)
    }

    const { data: updated, error: updErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    return jsonOk(updated, 'Order updated')
  } catch (e: any) {
    return jsonError('Failed to update order', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const supabase = createRouteHandlerClient(req)

    // Collect photos' public IDs for Cloudinary deletion
    const { data: photos } = await supabase.from('order_photos').select('public_id').eq('order_id', id)
    const publicIds = (photos ?? []).map((p) => p.public_id).filter(Boolean)

    const { error: delErr } = await supabase.from('orders').delete().eq('id', id)
    if (delErr) return jsonError(delErr.message, 400)

    if (publicIds.length > 0) {
      try {
        await cloudinary.api.delete_resources(publicIds)
      } catch (e) {
        // Non-fatal; log only
        // eslint-disable-next-line no-console
        console.error('Cloudinary delete error', e)
      }
    }

    return jsonOk({ id: params.id }, 'Order deleted')
  } catch (e: any) {
    return jsonError('Failed to delete order', 500)
  }
}
