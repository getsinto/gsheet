import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import { requireAuth } from '@/lib/supabase/api'
import { jsonError } from '@/lib/api/response'
import { parseOrderFilters } from '@/lib/api/filters'
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
    const filters = parseOrderFilters(searchParams)

    const supabase = createRouteHandlerClient(req)
    let query = supabase.from('orders').select('*')
    if (current.role !== 'admin') query = query.eq('driver_id', current.id)

    if (filters.status && filters.status.length > 0) query = query.in('status', filters.status as OrderStatus[])
    if (filters.driver_id) query = query.eq('driver_id', filters.driver_id)
    if (filters.week_number) query = query.eq('week_number', filters.week_number)
    if (filters.start_date) query = query.gte('date', filters.start_date)
    if (filters.end_date) query = query.lte('date', filters.end_date)
    if (filters.search) {
      const s = filters.search.replace(/%/g, '')
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
