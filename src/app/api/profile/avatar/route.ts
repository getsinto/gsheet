import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return jsonError('No file uploaded', 400)

    if (!file.type.startsWith('image/')) return jsonError('Only image uploads are allowed', 400)
    if (file.size > 2 * 1024 * 1024) return jsonError('File too large (max 2MB)', 400)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const upload = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'avatars' },
        (err, result) => {
          if (err || !result) return reject(err)
          resolve({ secure_url: result.secure_url!, public_id: result.public_id! })
        }
      )
      stream.end(buffer)
    })

    const supabase = createRouteHandlerClient(req)

    // Best-effort old avatar cleanup (derive public_id if cloudinary URL)
    const { data: user } = await supabase.from('users').select('avatar_url').eq('id', current.id).single()
    const oldUrl = user?.avatar_url as string | undefined
    if (oldUrl && oldUrl.includes('res.cloudinary.com')) {
      const lastSlash = oldUrl.lastIndexOf('/')
      const lastDot = oldUrl.lastIndexOf('.')
      if (lastSlash !== -1 && lastDot !== -1 && lastDot > lastSlash) {
        const pub = oldUrl.substring(lastSlash + 1, lastDot)
        try { await cloudinary.uploader.destroy(`avatars/${pub}`) } catch {}
      }
    }

    const { data: updated, error } = await supabase
      .from('users')
      .update({ avatar_url: upload.secure_url })
      .eq('id', current.id)
      .select('*')
      .single()

    if (error) return jsonError(error.message, 400)

    return jsonOk({ avatar_url: updated.avatar_url }, 'Avatar updated')
  } catch (e: any) {
    return jsonError('Failed to upload avatar', 500)
  }
}
