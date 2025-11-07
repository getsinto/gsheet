import { NextRequest } from 'next/server'
import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonError } from '@/lib/api/response'
import cloudinary from '@/lib/cloudinary/config'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  try {
    const { id, photoId } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    const { data: photo, error } = await supabase
      .from('order_photos')
      .select('*')
      .eq('id', photoId)
      .eq('order_id', id)
      .single()

    if (error && error.code === 'PGRST116') return jsonError('Photo not found', 404)
    if (error) return jsonError(error.message, 400)

    // Only uploader or admin can delete
    if (current.role !== 'admin' && photo.uploaded_by !== current.id) return jsonError('Forbidden', 403)

    // Delete from Cloudinary first
    try {
      await cloudinary.uploader.destroy(photo.public_id)
    } catch (e) {
      // Log error but proceed to remove DB record to avoid orphan
      console.error('Cloudinary destroy error', e)
    }

    const { error: delErr } = await supabase.from('order_photos').delete().eq('id', params.photoId)
    if (delErr) return jsonError(delErr.message, 400)

    return jsonOk({ id: params.photoId }, 'Photo deleted')
  } catch (e: any) {
    return jsonError('Failed to delete photo', 500)
  }
}
