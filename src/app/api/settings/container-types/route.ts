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
    const parsed = z.object({ container_types: z.array(z.string().min(1)) }).safeParse(body)
    if (!parsed.success) return jsonError('Invalid container_types', 400)

    await updateSetting('container_types', parsed.data.container_types, user!.id, req)
    const settings = await getSettingsObject(req)
    return jsonOk({ container_types: settings.container_types ?? [] })
  } catch (e: any) {
    return jsonError('Failed to update container types', 500)
  }
}
