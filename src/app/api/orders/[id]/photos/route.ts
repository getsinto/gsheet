import { createRouteHandlerClient, requireAuth } from '@/lib/supabase/api'
import { jsonOk, jsonCreated, jsonError } from '@/lib/api/response'
import cloudinary, { uploadImage } from '@/lib/cloudinary/config'
import { validateImageFile, generateUniqueFilename } from '@/lib/utils/fileUpload'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)

    // Verify order and permission
    const { data: order, error: ordErr } = await supabase.from('orders').select('*').eq('id', id).single()
    if (ordErr && ordErr.code === 'PGRST116') return jsonError('Order not found', 404)
    if (ordErr) return jsonError(ordErr.message, 400)

    const canUpload = current.role === 'admin' || order.driver_id === current.id
    if (!canUpload) return jsonError('Forbidden', 403)

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return jsonError('No file uploaded', 400)

    // Validate image (jpeg/png/heic/heif), <= 10MB
    if (!validateImageFile(file)) return jsonError('Invalid file type or size (>10MB)', 400)

    const buffer = Buffer.from(await file.arrayBuffer())
    const folder = `orders/${id}`
    const filename = generateUniqueFilename((file as any).name ?? 'photo.jpg')

    const uploaded = await uploadImage(buffer, folder, filename)

    const { data: photo, error: insErr } = await supabase
      .from('order_photos')
      .insert({
        order_id: id,
        photo_url: uploaded.secure_url,
        public_id: uploaded.public_id,
        uploaded_by: current.id,
      })
      .select('*')
      .single()

    if (insErr) {
      // cleanup on DB failure
      try { await cloudinary.uploader.destroy(uploaded.public_id) } catch {}
      return jsonError(insErr.message, 400)
    }

    return jsonCreated(photo, 'Photo uploaded')
  } catch (e: any) {
    return jsonError('Failed to upload photo', 500)
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const auth = await requireAuth(req)
    if (auth.error) return jsonError(auth.error.message, auth.error.status)
    const current = auth.user!

    const supabase = createRouteHandlerClient(req)
    const { data: order, error: ordErr } = await supabase.from('orders').select('driver_id').eq('id', id).single()
    if (ordErr && ordErr.code === 'PGRST116') return jsonError('Order not found', 404)
    if (ordErr) return jsonError(ordErr.message, 400)

    const canRead = current.role === 'admin' || order.driver_id === current.id
    if (!canRead) return jsonError('Forbidden', 403)

    const { data, error } = await supabase
      .from('order_photos')
      .select('*, uploader:users!order_photos_uploaded_by_fkey(id,full_name,email,avatar_url,role)')
      .eq('order_id', id)
      .order('created_at', { ascending: false })

    if (error) return jsonError(error.message, 400)
    return jsonOk(data ?? [])
  } catch (e: any) {
    return jsonError('Failed to fetch photos', 500)
  }
}
