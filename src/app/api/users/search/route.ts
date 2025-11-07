import { NextRequest } from 'next/server'
import { requireAuth, createRouteHandlerClient } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').trim()
    if (!q) return jsonOk([])

    const supabase = createRouteHandlerClient(req)
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, avatar_url')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
      .order('full_name', { ascending: true })
      .limit(10)

    if (error) return jsonError(error.message, 400)

    return jsonOk(data ?? [])
  } catch (e: any) {
    return jsonError('Failed to search users', 500)
  }
}
