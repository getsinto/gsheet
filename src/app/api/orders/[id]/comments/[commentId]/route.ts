import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'

const bodySchema = z.object({ comment: z.string().min(1).max(1000) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const { id, commentId } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    const { data: existing, error: getErr } = await supabase
      .from('order_comments')
      .select('*')
      .eq('id', commentId)
      .eq('order_id', id)
      .single()
    if (getErr && getErr.code === 'PGRST116') return jsonError('Comment not found', 404)
    if (getErr) return jsonError(getErr.message, 400)

    if ((existing as any).user_id !== current.id) return jsonError('Forbidden', 403)

    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const { data: updated, error: updErr } = await (supabase as any)
      .from('order_comments')
      .update({ comment: parsed.data.comment })
      .eq('id', commentId)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    return jsonOk(updated, 'Comment updated')
  } catch (e: any) {
    return jsonError('Failed to update comment', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const { id, commentId } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    const { data: existing, error: getErr } = await supabase
      .from('order_comments')
      .select('*, user:users!order_comments_user_id_fkey(id,role)')
      .eq('id', commentId)
      .eq('order_id', id)
      .single()
    if (getErr && getErr.code === 'PGRST116') return jsonError('Comment not found', 404)
    if (getErr) return jsonError(getErr.message, 400)

    if ((existing as any).user_id !== current.id && current.role !== 'admin') return jsonError('Forbidden', 403)

    const { error: delErr } = await supabase.from('order_comments').delete().eq('id', commentId)
    if (delErr) return jsonError(delErr.message, 400)

    return jsonOk({ id: commentId }, 'Comment deleted')
  } catch (e: any) {
    return jsonError('Failed to delete comment', 500)
  }
}
