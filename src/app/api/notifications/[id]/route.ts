import { NextRequest } from 'next/server'
import { requireAuth, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const { data: notif, error } = await supabase.from('notifications').select('*').eq('id', id).single()
    if (error && error.code === 'PGRST116') return jsonError('Notification not found', 404)
    if (error) return jsonError(error.message, 400)

    if ((notif as any).user_id !== current.id) return jsonError('Forbidden', 403)

    const { error: delErr } = await supabase.from('notifications').delete().eq('id', id)
    if (delErr) return jsonError(delErr.message, 400)

    return jsonOk({ id }, 'Notification deleted')
  } catch (e: any) {
    return jsonError('Failed to delete notification', 500)
  }
}
