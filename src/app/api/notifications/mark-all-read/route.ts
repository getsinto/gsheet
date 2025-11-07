import { NextRequest } from 'next/server'
import { requireAuth, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', current.id)
      .eq('is_read', false)

    if (error) return jsonError(error.message, 400)

    return jsonOk({ success: true }, 'All marked read')
  } catch (e: any) {
    return jsonError('Failed to mark all notifications read', 500)
  }
}
