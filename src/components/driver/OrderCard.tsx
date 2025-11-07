"use client"

import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, MapPin } from "lucide-react"

export function OrderCard({ order, compact }: { order: any; compact?: boolean }) {
  const color = statusColor(order.status)
  const callHref = order.customer_phone ? `tel:${order.customer_phone}` : undefined
  const directionsHref = order.customer_address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.customer_address)}` : undefined

  return (
    <Link href={`/app/(dashboard)/driver/orders/${order.id}`} className="block">
      <Card className="relative overflow-hidden p-4 transition-shadow hover:shadow-md">
        <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs text-muted-foreground">#{order.order_number || order.id}</div>
          <Badge className="capitalize" style={{ backgroundColor: color, color:'white' }}>{order.status}</Badge>
        </div>
        <div className="mt-1 text-base font-semibold">{order.customer_name}</div>
        <div className="text-sm text-muted-foreground">{order.date} • {order.time_window}</div>
        {!compact && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="truncate text-muted-foreground">{order.customer_address}</div>
            <div className="text-right font-medium text-emerald-600">${Number(order.driver_pay||0).toFixed(2)}</div>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{order.container_type} {order.condition}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {order.customer_phone && <a onClick={(e)=>e.stopPropagation()} href={callHref} className="inline-flex"><Button size="sm" variant="outline"><Phone className="mr-1 h-4 w-4" /> Call</Button></a>}
          {order.customer_address && <a onClick={(e)=>e.stopPropagation()} href={directionsHref} target="_blank" className="inline-flex"><Button size="sm" variant="outline"><MapPin className="mr-1 h-4 w-4" /> Map</Button></a>}
          <div className="ml-auto"><Button size="sm">View Details</Button></div>
        </div>
      </Card>
    </Link>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'dispatched': return '#eab308'
    case 'loaded': return '#22c55e'
    case 'notified': return '#065f46'
    case 'delayed': return '#f59e0b'
    case 'cancelled': return '#ef4444'
    case 'delivered': return '#6b7280'
    default: return '#94a3b8'
  }
}
