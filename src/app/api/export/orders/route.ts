import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAuth, requireAdmin } from '@/lib/supabase/api'
import { jsonError } from '@/lib/api/response'
import type { OrderStatus } from '@/types'

function toCSV(rows: any[]): string {
  const headers = [
    'Order Number','Date','Driver','Customer','Market','Pickup Address','Delivery Address','Container Type','Status','Miles','Driver Pay','Notes'
  ]
  const lines = [headers.join(',')]
  for (const r of rows) {
    const pickup = `${r.pickup_street} ${r.pickup_city}, ${r.pickup_state} ${r.pickup_zip}`.trim()
    const delivery = `${r.customer_street} ${r.customer_city}, ${r.customer_state} ${r.customer_zip}`.trim()
    const vals = [
      r.order_number,
      r.date,
      r.driver_name,
      r.customer_name,
      r.market,
      pickup,
      delivery,
      r.container_type,
      r.status,
      r.miles,
      r.driver_pay,
      (r.notes ?? '').replace(/\r?\n/g, ' '),
    ].map((v) => {
      const s = String(v ?? '')
      return s.includes(',') ? '"' + s.replace(/"/g, '""') + '"' : s
    })
    lines.push(vals.join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return new Response(JSON.stringify({ success: false, error: auth.error.message }), { status: auth.error.status })
    const current = auth.user!

    const { searchParams } = new URL(req.url)
    const supabase = createRouteHandlerClient(req)

    let query = supabase.from('orders').select('*')
    if (current.role !== 'admin') query = query.eq('driver_id', current.id)

    const status = searchParams.get('status')
    const driver_id = searchParams.get('driver_id')
    const week_number = searchParams.get('week_number')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const search = searchParams.get('search')

    if (status) query = query.in('status', status.split(',') as OrderStatus[])
    if (driver_id) query = query.eq('driver_id', driver_id)
    if (week_number) query = query.eq('week_number', Number(week_number))
    if (start_date) query = query.gte('date', start_date)
    if (end_date) query = query.lte('date', end_date)
    if (search) {
      const s = search.replace(/%/g, '')
      query = query.or(`order_number.ilike.%${s}%,customer_name.ilike.%${s}%,driver_name.ilike.%${s}%`)
    }

    const { data, error } = await query.order('date', { ascending: false })
    if (error) return jsonError(error.message, 400)

    const csv = toCSV(data ?? [])
    const date = new Date().toISOString().slice(0, 10)
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-export-${date}.csv"`,
      },
    })
  } catch (e: any) {
    return jsonError('Failed to export orders', 500)
  }
}
