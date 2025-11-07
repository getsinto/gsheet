import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAdmin } from '@/lib/supabase/api'
import { jsonError } from '@/lib/api/response'

function toCSV(rows: any[]): string {
  const headers = ['Name','Email','Phone','Total Orders','Completed','Earnings','Miles']
  const lines = [headers.join(',')]
  for (const r of rows) {
    const vals = [
      r.full_name,
      r.email,
      r.phone ?? '',
      r.total_orders ?? 0,
      r.completed_orders ?? 0,
      r.total_earnings ?? 0,
      r.total_miles ?? 0,
    ].map((v) => String(v ?? ''))
    lines.push(vals.join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if (auth.error) return new Response(JSON.stringify({ success: false, error: auth.error.message }), { status: auth.error.status })

    const supabase = createRouteHandlerClient(req)
    const { data: users, error: uerr } = await supabase
      .from('users')
      .select('id,full_name,email,phone')
      .eq('role', 'driver')
      .eq('is_active', true)
    if (uerr) return jsonError(uerr.message, 400)

    const ids = ((users ?? []) as any[]).map((u) => u.id)
    const { data: orders, error: oerr } = await supabase
      .from('orders')
      .select('driver_id,status,driver_pay,miles')
      .in('driver_id', ids)
    if (oerr) return jsonError(oerr.message, 400)

    const stats = new Map<string, { total_orders: number; completed_orders: number; total_earnings: number; total_miles: number }>()
    for (const id of ids) stats.set(id, { total_orders: 0, completed_orders: 0, total_earnings: 0, total_miles: 0 })
    for (const o of ((orders ?? []) as any[])) {
      const s = stats.get(o.driver_id as string)
      if (!s) continue
      s.total_orders++
      if (o.status === 'delivered') s.completed_orders++
      s.total_earnings += Number(o.driver_pay ?? 0)
      s.total_miles += Number(o.miles ?? 0)
    }

    const rows = ((users ?? []) as any[]).map((u) => ({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      ...(stats.get(u.id) ?? {}),
    }))

    const csv = toCSV(rows)
    const date = new Date().toISOString().slice(0, 10)
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="drivers-export-${date}.csv"`,
      },
    })
  } catch (e: any) {
    return jsonError('Failed to export drivers', 500)
  }
}
