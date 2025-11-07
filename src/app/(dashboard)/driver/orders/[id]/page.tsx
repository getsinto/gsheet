"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { useDriverOrderById, useUpdateOrderStatus, useOrderComments, useAddOrderComment, useOrderPhotos, useUploadPhoto, useDeletePhoto } from "@/lib/hooks/useDriverOrders"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { MoreHorizontal, ArrowLeft, Phone, MapPin } from "lucide-react"
import { UploadPhoto } from "@/components/driver/UploadPhoto"
import { DeliveryMap } from "@/components/driver/DeliveryMap"
import { ReportIssueModal } from "@/components/driver/ReportIssueModal"
import { toast } from "react-hot-toast"

export default function DriverOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id)
  const { data: order, isLoading } = useDriverOrderById(id)
  const updateStatus = useUpdateOrderStatus()
  const { data: comments } = useOrderComments(id)
  const addComment = useAddOrderComment()
  const { data: photos } = useOrderPhotos(id)
  const uploadPhoto = useUploadPhoto(id)
  const delPhoto = useDeletePhoto(id)
  const [issueOpen, setIssueOpen] = React.useState(false)
  const [newComment, setNewComment] = React.useState('')

  if (isLoading || !order) return <div className="space-y-3"><Card className="h-10 animate-pulse" /><Card className="h-24 animate-pulse" /><Card className="h-24 animate-pulse" /></div>

  const callHref = order.customer_phone ? `tel:${order.customer_phone}` : undefined
  const directionsHref = order.customer_address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customer_address)}` : undefined

  const onToggle = async (field: 'loaded'|'notified'|'delivered')=>{
    const nextStatus = field==='loaded' ? 'loaded' : field==='notified' ? 'notified' : 'delivered'
    if (nextStatus==='delivered') {
      if (!confirm('Mark this order as delivered? This will lock the order.')) return
    }
    try {
      await updateStatus.mutateAsync({ id: order.id, status: nextStatus })
      toast.success('Status updated')
    } catch (e:any) {
      toast.error(e?.message || 'Failed to update status')
    }
  }

  const onSubmitComment = async ()=>{
    if (!newComment.trim()) return
    try { await addComment.mutateAsync({ id, content: newComment }); setNewComment('') } catch (e:any) { toast.error(e?.message||'Failed to comment') }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-14 z-10 -mx-4 flex items-center justify-between bg-background px-4 py-2">
        <Button variant="ghost" size="icon" onClick={()=>router.back()} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">Order {order.order_number || order.id}</div>
          <Badge className="capitalize">{order.status}</Badge>
        </div>
        <Button variant="ghost" size="icon" aria-label="Actions"><MoreHorizontal className="h-5 w-5" /></Button>
      </div>

      {/* Customer Info */}
      <Card className="p-4">
        <div className="text-sm font-medium">{order.customer_name}</div>
        <div className="text-sm text-muted-foreground">{order.customer_address}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {order.customer_phone && <a href={callHref} className="inline-flex"><Button size="sm" variant="outline"><Phone className="mr-1 h-4 w-4" /> Call</Button></a>}
          {order.customer_address && <a href={directionsHref} target="_blank" className="inline-flex"><Button size="sm" variant="outline"><MapPin className="mr-1 h-4 w-4" /> Get Directions</Button></a>}
          <Button size="sm" variant="outline" onClick={()=>setIssueOpen(true)}>Report Issue</Button>
        </div>
        <div className="mt-3">
          <DeliveryMap address={order.customer_address} />
        </div>
      </Card>

      {/* Order Details */}
      <Card className="p-4 space-y-2">
        <Row label="Order #" value={order.order_number || order.id} />
        <Row label="Date / Window" value={`${order.date || ''} ${order.time_window || ''}`} />
        <Row label="Pickup" value={order.pickup_address || '-'} />
        <Row label="Container" value={`${order.container_type || ''} ${order.condition || ''}`} />
        <Row label="Doors" value={order.door_position || '-'} />
        <Row label="Release" value={order.release_number || '-'} />
        <Row label="Miles" value={order.miles ?? '-'} />
        <Row label="Driver Pay" value={order.driver_pay ? `$${Number(order.driver_pay).toFixed(2)}` : '-'} />
        {order.notes && <div className="pt-2 text-sm"><div className="text-xs text-muted-foreground">Notes</div><div className="whitespace-pre-wrap">{order.notes}</div></div>}
      </Card>

      {/* Status Updates */}
      <Card className="p-4">
        <div className="mb-2 text-sm font-medium">Status</div>
        <div className="grid grid-cols-1 gap-2">
          <label className="flex items-center gap-3 text-sm"><Checkbox checked={order.status==='loaded' || order.status==='notified' || order.status==='delivered'} onCheckedChange={()=>onToggle('loaded')} /> Loaded</label>
          <label className="flex items-center gap-3 text-sm"><Checkbox checked={order.status==='notified' || order.status==='delivered'} onCheckedChange={()=>onToggle('notified')} /> Notified Customer</label>
          <label className="flex items-center gap-3 text-sm"><Checkbox checked={order.status==='delivered'} onCheckedChange={()=>onToggle('delivered')} /> Delivered</label>
        </div>
      </Card>

      {/* Photos */}
      <Card className="p-4">
        <div className="mb-2 text-sm font-medium">Container Photos</div>
        <UploadPhoto orderId={id} onUploaded={()=>{ /* refetch handled by hook invalidate */ }} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(photos||[]).map((p: any)=> (
            <div key={p.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="photo" className="h-24 w-full rounded object-cover" />
              <button className="absolute right-1 top-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white" onClick={()=>delPhoto.mutate({ photoId: p.id })}>Delete</button>
            </div>
          ))}
        </div>
      </Card>

      {/* Comments */}
      <Card className="p-4">
        <div className="mb-2 text-sm font-medium">Comments</div>
        <div className="space-y-2">
          {(comments||[]).map((c: any)=> (
            <div key={c.id} className="rounded border p-2 text-sm"><div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>{c.content}</div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Textarea rows={2} placeholder="Add a comment" value={newComment} onChange={(e)=>setNewComment(e.target.value)} />
          <Button onClick={onSubmitComment}>Send</Button>
        </div>
      </Card>

      {/* Bottom actions */}
      <div className="sticky bottom-14 z-10 -mx-4 border-t bg-background px-4 py-2 sm:bottom-0">
        <div className="grid grid-cols-3 gap-2">
          {order.status!=='loaded' && <Button className="h-12" onClick={()=>onToggle('loaded')}>Mark as Loaded</Button>}
          {order.status==='loaded' && order.status!=='delivered' && <Button variant="secondary" className="h-12" onClick={()=>onToggle('delivered')}>Mark as Delivered</Button>}
          <Button variant="outline" className="h-12" onClick={()=>setIssueOpen(true)}>Report Issue</Button>
        </div>
      </div>

      <ReportIssueModal open={issueOpen} onOpenChange={setIssueOpen} orderId={id} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 items-center text-sm">
      <div className="col-span-1 text-xs text-muted-foreground">{label}</div>
      <div className="col-span-2 font-medium break-words">{value}</div>
    </div>
  )
}
