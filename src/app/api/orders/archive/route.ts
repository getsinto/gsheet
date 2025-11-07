import { NextRequest } from 'next/server'
import { requireAdmin, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const body = await req.json()
    const week_number = (body?.week_number ?? null) as 1 | 2 | null
    if (week_number !== 1 && week_number !== 2) return jsonError('week_number must be 1 or 2', 400)

    const supabase = createRouteHandlerClient(req)

    const { data, error: qerr } = await supabase
      .from('orders')
      .select('id')
      .eq('week_number', week_number)
      .eq('status', 'delivered')
      .neq('is_archived', true)
    if (qerr) return jsonError(qerr.message, 400)

    const ids = (data ?? []).map((o) => o.id)
    if (ids.length === 0) return jsonOk({ archived_count: 0 }, 'No delivered orders to archive')

    const { error: updErr } = await supabase
      .from('orders')
      .update({ is_archived: true })
      .in('id', ids)
    if (updErr) return jsonError(updErr.message, 400)

    return jsonOk({ archived_count: ids.length }, 'Orders archived')
  } catch (e: any) {
    return jsonError('Failed to archive orders', 500)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const per_page = Math.min(200, Math.max(1, Number(searchParams.get('per_page') ?? 50)))
    const from = (page - 1) * per_page
    const to = from + per_page - 1

    const supabase = createRouteHandlerClient(req)

    let q = supabase.from('orders').select('*', { count: 'exact' }).eq('is_archived', true)
    q = q.order('date', { ascending: false }).range(from, to)

    const { data, error: qerr, count } = await q
    if (qerr) return jsonError(qerr.message, 400)

    const total = count ?? 0
    const total_pages = Math.max(1, Math.ceil(total / per_page))
    return new Response(JSON.stringify({ success: true, data, pagination: { total, page, per_page, total_pages } }), { status: 200 })
  } catch (e: any) {
    return jsonError('Failed to fetch archived orders', 500)
  }
}
