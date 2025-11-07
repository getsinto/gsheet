import { createRouteHandlerClient } from '@/lib/supabase/api'

export async function createOrderAssignedNotification(orderId: string, driverId: string) {
  const supabase = createRouteHandlerClient()
  const { data: order } = await supabase.from('orders').select('order_number').eq('id', orderId).single()
  const message = order ? `You've been assigned order #${order.order_number}` : 'You have been assigned a new order'
  await supabase.from('notifications').insert({
    user_id: driverId,
    title: 'New Order Assigned',
    message,
    type: 'order_assigned',
    order_id: orderId,
  })
}

export async function createStatusChangedNotification(orderId: string, status: string, adminIds: string[]) {
  const supabase = createRouteHandlerClient()
  const { data: order } = await supabase.from('orders').select('order_number').eq('id', orderId).single()
  const message = order ? `Order #${order.order_number} status changed to ${status}` : `Order status changed to ${status}`
  for (const uid of adminIds) {
    await supabase.from('notifications').insert({
      user_id: uid,
      title: 'Order Status Updated',
      message,
      type: 'status_changed',
      order_id: orderId,
    })
  }
}

export async function createOrderDelayedNotification(orderId: string, reason: string | null, adminIds: string[]) {
  const supabase = createRouteHandlerClient()
  const { data: order } = await supabase.from('orders').select('order_number').eq('id', orderId).single()
  const base = order ? `Order #${order.order_number} delayed` : 'Order delayed'
  const message = reason ? `${base}: ${reason}` : base
  for (const uid of adminIds) {
    await supabase.from('notifications').insert({
      user_id: uid,
      title: 'Order Delayed',
      message,
      type: 'order_delayed',
      order_id: orderId,
    })
  }
}

export async function createOrderCreatedNotification(orderId: string, adminIds: string[]) {
  const supabase = createRouteHandlerClient()
  const { data: order } = await supabase.from('orders').select('order_number').eq('id', orderId).single()
  const message = order ? `Order #${order.order_number} created` : 'New order created'
  for (const uid of adminIds) {
    await supabase.from('notifications').insert({
      user_id: uid,
      title: 'Order Created',
      message,
      type: 'order_created',
      order_id: orderId,
    })
  }
}
