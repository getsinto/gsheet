import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    if (user!.id === id) return jsonError('Cannot change your own status', 400)

    const supabase = createRouteHandlerClient(req)

    // Toggle
    const { data: existing, error: getErr } = await supabase.from('users').select('id,is_active,full_name').eq('id', id).single()
    if (getErr) return jsonError(getErr.message, 400)

    const newActive = !Boolean(existing.is_active)

    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update({ is_active: newActive })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    // If deactivating, unassign from future orders
    if (!newActive) {
      const today = new Date().toISOString().slice(0, 10)
      await supabase
        .from('orders')
        .update({ driver_id: null, driver_name: 'Unassigned' })
        .gte('date', today)
        .eq('driver_id', id)
        .not('status', 'in', '(delivered,cancelled)')
    }

    return jsonOk(updated, newActive ? 'User activated' : 'User deactivated')
  } catch (e: any) {
    return jsonError('Failed to toggle user status', 500)
  }
}
