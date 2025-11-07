import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth, requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'

const partialUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin','driver','dispatcher']).optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const { data: user, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error && error.code === 'PGRST116') return jsonError('User not found', 404)
    if (error) return jsonError(error.message, 400)

    if (current.role !== 'admin' && current.id !== user.id) return jsonError('Forbidden', 403)

    // Stats
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('driver_id', user.id)
      .order('date', { ascending: false })

    const total_orders = (orders ?? []).length
    const completed_orders = (orders ?? []).filter((o) => o.status === 'delivered').length
    const total_earnings = (orders ?? []).reduce((s, o) => s + Number(o.driver_pay ?? 0), 0)
    const total_miles = (orders ?? []).reduce((s, o) => s + Number(o.miles ?? 0), 0)

    const recent_orders = (orders ?? []).slice(0, 10)

    return jsonOk({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      stats: { total_orders, completed_orders, total_earnings, total_miles },
      recent_orders,
    })
  } catch (e: any) {
    return jsonError('Failed to fetch user', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const body = await req.json()
    const parsed = partialUserSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const supabase = createRouteHandlerClient(req)
    const { data: existing, error: getErr } = await supabase.from('users').select('*').eq('id', id).single()
    if (getErr && getErr.code === 'PGRST116') return jsonError('User not found', 404)
    if (getErr) return jsonError(getErr.message, 400)

    const isSelf = current.id === existing.id
    const isAdmin = current.role === 'admin'

    // Non-admins cannot change role or email
    if (!isAdmin) {
      if ('role' in parsed.data) return jsonError('Forbidden to change role', 403)
      if ('email' in parsed.data) return jsonError('Forbidden to change email', 403)
      if (!isSelf) return jsonError('Forbidden', 403)
    }

    // If email changed by admin, update Auth metadata/email
    if (isAdmin && parsed.data.email && parsed.data.email !== existing.email) {
      try {
        await (createRouteHandlerClient(req) as any).auth.admin.updateUserById(existing.id, { email: parsed.data.email })
      } catch (e) {
        // ignore if not allowed; continue to update table
      }
    }

    const updatePayload: any = { ...parsed.data }

    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updErr) return jsonError(updErr.message, 400)

    return jsonOk({
      id: updated.id,
      email: updated.email,
      full_name: updated.full_name,
      phone: updated.phone,
      role: updated.role,
      avatar_url: updated.avatar_url,
      is_active: updated.is_active,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    }, 'Profile updated')
  } catch (e: any) {
    return jsonError('Failed to update user', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    if (user!.id === id) return jsonError('Cannot delete your own account', 400)

    const supabase = createRouteHandlerClient(req)

    // Prevent delete if active (non-delivered) orders exist
    const { data: activeOrders, error: ordErr } = await supabase
      .from('orders')
      .select('id,status')
      .eq('driver_id', id)
      .not('status', 'in', '(delivered,cancelled)')
    if (ordErr) return jsonError(ordErr.message, 400)
    if ((activeOrders ?? []).length > 0) return jsonError('User has active orders', 400)

    // Delete from Auth (requires service role; best effort)
    try {
      await (supabase as any).auth.admin.deleteUser(id)
    } catch (e) {
      // Log only; continue with table deletion
      console.error('Auth deleteUser error', e)
    }

    const { error: delErr } = await supabase.from('users').delete().eq('id', id)
    if (delErr) return jsonError(delErr.message, 400)

    return jsonOk({ id: params.id }, 'User deleted')
  } catch (e: any) {
    return jsonError('Failed to delete user', 500)
  }
}
