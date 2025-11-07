import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { getSettingsObject } from '@/lib/settings/cache'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const { searchParams } = new URL(req.url)
    const weekParam = searchParams.get('week_number')
    const driverParam = searchParams.get('driver_id')

    const settings = await getSettingsObject()
    const week_number = weekParam ? (Number(weekParam) as 1 | 2) : (settings.current_week as 1 | 2 | undefined)

    const supabase = createRouteHandlerClient(req)

    let q = supabase.from('orders').select('*')
    if (current.role !== 'admin') q = q.eq('driver_id', current.id)
    if (driverParam) q = q.eq('driver_id', driverParam)
    if (week_number) q = q.eq('week_number', week_number)

    const today = new Date().toISOString().slice(0, 10)

    const { data, error } = await q
    if (error) return jsonError(error.message, 400)

    const orders = (data ?? []) as any[]
    const total_orders = orders.length
    const by_status = orders.reduce<Record<string, number>>((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc }, {})
    const dispatched_count = by_status.dispatched ?? 0
    const loaded_count = by_status.loaded ?? 0
    const notified_count = by_status.notified ?? 0
    const delayed_count = by_status.delayed ?? 0
    const cancelled_count = by_status.cancelled ?? 0
    const delivered_count = by_status.delivered ?? 0

    const active_drivers = new Set(orders.map((o) => o.driver_id).filter(Boolean)).size
    const total_revenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.driver_pay ?? 0), 0)
    const pending_revenue = orders.filter((o) => o.status !== 'delivered').reduce((s, o) => s + Number(o.driver_pay ?? 0), 0)
    const total_miles = orders.reduce((s, o) => s + Number(o.miles ?? 0), 0)
    const average_miles = total_orders ? Number((total_miles / total_orders).toFixed(2)) : 0
    const orders_today = orders.filter((o) => (o.date as unknown as string) === today).length

    return jsonOk({
      total_orders,
      orders_by_status: by_status,
      dispatched_count,
      loaded_count,
      notified_count,
      delayed_count,
      cancelled_count,
      delivered_count,
      active_drivers,
      total_revenue,
      pending_revenue,
      average_miles,
      total_miles,
      orders_today,
      orders_this_week: total_orders,
    })
  } catch (e: any) {
    return jsonError('Failed to compute dashboard stats', 500)
  }
}
