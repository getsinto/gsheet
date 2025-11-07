import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth, requireAdmin } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { getSettingsObject, updateSetting, refreshSettingsCache, loadSettings } from '@/lib/settings/cache'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)

    const settings = await getSettingsObject(req)
    return jsonOk(settings)
  } catch (e: any) {
    return jsonError('Failed to fetch settings', 500)
  }
}

const settingsSchema = z.object({
  company_name: z.string().min(1).optional(),
  default_pay_rate: z.number().positive().optional(),
  current_week: z.union([z.literal(1), z.literal(2)]).optional(),
  container_types: z.array(z.string().min(1)).optional(),
  markets: z.array(z.string().min(1)).optional(),
  podium_message_template: z.string().min(1).optional(),
  auto_lock_delivered: z.boolean().optional(),
  week_start_day: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin(req)
    if (error) return jsonError(error.message, error.status)

    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join(', '), 400)

    const updates = parsed.data
    for (const [k, v] of Object.entries(updates)) {
      await updateSetting(k, v, user!.id, req)
    }

    await refreshSettingsCache()
    const settings = await getSettingsObject(req)
    return jsonOk(settings, 'Settings updated')
  } catch (e: any) {
    return jsonError('Failed to update settings', 500)
  }
}
