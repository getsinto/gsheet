import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { z } from 'zod'
import { updateSetting, getSettingsObject } from '@/lib/settings/cache'

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const body = await req.json()
    const parsed = z.object({ week_number: z.union([z.literal(1), z.literal(2)]) }).safeParse(body)
    if (!parsed.success) return jsonError('Invalid week_number', 400)

    await updateSetting('current_week', parsed.data.week_number, user!.id, req)
    const settings = await getSettingsObject(req)
    return jsonOk({ current_week: settings.current_week })
  } catch (e: any) {
    return jsonError('Failed to update current week', 500)
  }
}
