import { createRouteHandlerClient } from '@/lib/supabase/api'

export async function logOrderCreated(orderId: string, userId: string, userName: string) {
  const supabase = createRouteHandlerClient()
  const { data: order } = await supabase.from('orders').select('order_number,customer_name,driver_name').eq('id', orderId).single()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'created',
    details: {
      order_number: order?.order_number,
      customer_name: order?.customer_name,
      driver_name: order?.driver_name,
    },
  })
}

export async function logOrderUpdated(orderId: string, userId: string, userName: string, changes: { old: any; new: any }) {
  const changed_fields = Object.keys({ ...(changes.old ?? {}), ...(changes.new ?? {}) })
  const supabase = createRouteHandlerClient()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'updated',
    details: {
      changed_fields,
      old_values: changes.old ?? {},
      new_values: changes.new ?? {},
    },
  })
}

export async function logOrderDeleted(orderId: string, userId: string, userName: string) {
  const supabase = createRouteHandlerClient()
  const deleted_at = new Date().toISOString()
  const { data: order } = await supabase.from('orders').select('order_number').eq('id', orderId).maybeSingle()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'deleted',
    details: { order_number: order?.order_number, deleted_at },
  })
}

export async function logStatusChanged(orderId: string, userId: string, userName: string, oldStatus: string | null, newStatus: string, reason?: string | null) {
  const supabase = createRouteHandlerClient()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'status_changed',
    details: { old_status: oldStatus, new_status: newStatus, status_reason: reason ?? null },
  })
}

export async function logDriverAssigned(orderId: string, userId: string, userName: string, oldDriver: string | null, newDriver: string | null) {
  const supabase = createRouteHandlerClient()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'assigned',
    details: { old_driver: oldDriver, new_driver: newDriver },
  })
}

export async function logPhotoUploaded(orderId: string, userId: string, userName: string, photoUrl: string) {
  const supabase = createRouteHandlerClient()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'updated',
    details: { photo_url: photoUrl },
  })
}

export async function logCommentAdded(orderId: string, userId: string, userName: string, comment: string) {
  const supabase = createRouteHandlerClient()
  await supabase.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    user_name: userName,
    action: 'updated',
    details: { comment_preview: comment.slice(0, 140) },
  })
}
