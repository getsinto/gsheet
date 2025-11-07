import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api'
import type { Database } from '@/types/database.types'

export type UserStats = {
  total_orders: number
  completed_orders: number
  cancelled_orders: number
  total_earnings: number
  total_miles: number
}

export async function computeStatsForUsers(userIds: string[], req: NextRequest) {
  const supabase = createRouteHandlerClient(req)
  const { data, error } = await supabase
    .from('orders')
    .select('driver_id,status,driver_pay,miles')
    .in('driver_id', userIds)
  if (error) throw new Error(error.message)

  const map = new Map<string, UserStats>()
  for (const id of userIds) {
    map.set(id, { total_orders: 0, completed_orders: 0, cancelled_orders: 0, total_earnings: 0, total_miles: 0 })
  }
  for (const o of data ?? []) {
    const s = map.get(o.driver_id as string)
    if (!s) continue
    s.total_orders += 1
    if (o.status === 'delivered') s.completed_orders += 1
    if (o.status === 'cancelled') s.cancelled_orders += 1
    s.total_earnings += Number(o.driver_pay ?? 0)
    s.total_miles += Number(o.miles ?? 0)
  }
  return map
}
