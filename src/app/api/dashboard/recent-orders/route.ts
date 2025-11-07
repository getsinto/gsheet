import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    let q = supabase
      .from('orders')
      .select('id,order_number,customer_name,driver_name,status,date,created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (current.role !== 'admin') q = q.eq('driver_id', current.id)

    const { data, error } = await q
    if (error) return jsonError(error.message, 400)

    return jsonOk(data ?? [])
  } catch (e: any) {
    return jsonError('Failed to fetch recent orders', 500)
  }
}
