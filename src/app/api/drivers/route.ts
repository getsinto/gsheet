import { NextRequest } from 'next/server'
import { requireAuth, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)

    const supabase = createRouteHandlerClient(req)
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, phone, email')
      .eq('role', 'driver')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) return jsonError(error.message, 400)

    return jsonOk(data ?? [])
  } catch (e: any) {
    return jsonError('Failed to fetch drivers', 500)
  }
}
