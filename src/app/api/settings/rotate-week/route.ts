import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { getSettingsObject, updateSetting } from '@/lib/settings/cache'

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const settings = await getSettingsObject(req)
    const cur = settings.current_week === 1 ? 1 : settings.current_week === 2 ? 2 : 1
    const nextWeek = cur === 1 ? 2 : 1

    await updateSetting('current_week', nextWeek, user!.id, req)

    // Optional: notify all users
    // This requires listing users; do best-effort
    try {
      const { createRouteHandlerClient } = await import('@/lib/supabase/api')
      const supabase = createRouteHandlerClient(req)
      const { data: users } = await supabase.from('users').select('id').eq('is_active', true)
      for (const u of users ?? []) {
        await supabase.from('notifications').insert({
          user_id: u.id,
          title: 'Week Rotated',
          message: `Current week is now ${nextWeek}.`,
          type: 'status_changed',
        })
      }
    } catch (e) {
      console.error('Week rotation notification error', e)
    }

    return jsonOk({ current_week: nextWeek, archived_count: null }, 'Week rotated')
  } catch (e: any) {
    return jsonError('Failed to rotate week', 500)
  }
}
