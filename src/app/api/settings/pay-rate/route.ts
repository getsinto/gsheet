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
    const parsed = z.object({ rate: z.number().positive() }).safeParse(body)
    if (!parsed.success) return jsonError('Invalid rate', 400)

    await updateSetting('default_pay_rate', parsed.data.rate, user!.id, req)
    const settings = await getSettingsObject(req)
    return jsonOk({ default_pay_rate: settings.default_pay_rate })
  } catch (e: any) {
    return jsonError('Failed to update pay rate', 500)
  }
}
