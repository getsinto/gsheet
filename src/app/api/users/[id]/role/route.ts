import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const body = await req.json()
    const parsed = z.object({ role: z.enum(['admin','driver','dispatcher']) }).safeParse(body)
    if (!parsed.success) return jsonError('Invalid role', 400)

    if (user!.id === params.id) return jsonError('Cannot change your own role', 400)

    const supabase = createRouteHandlerClient(req)

    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update({ role: parsed.data.role })
      .eq('id', id)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    // Notification for user
    await supabase.from('notifications').insert({
      user_id: id,
      title: 'Role changed',
      message: `Your role has been changed to ${parsed.data.role}`,
      type: 'status_changed',
    })

    return jsonOk(updated, 'Role updated')
  } catch (e: any) {
    return jsonError('Failed to update role', 500)
  }
}
