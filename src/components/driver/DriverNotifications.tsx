"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useDriverNotifications } from "@/lib/hooks/useDriverOrders"

export function DriverNotifications() {
  const { data, markAllRead } = useDriverNotifications()
  const unread = data?.unread_count ?? 0
  const items = data?.items ?? []
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unread>0 && <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b p-2 text-sm font-medium">Notifications</div>
        <div className="max-h-80 space-y-1 overflow-auto p-2">
          {items.length===0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : items.map((n)=> (
            <div key={n.id} className="rounded p-2 text-sm hover:bg-muted">
              <div className="font-medium">{n.title || n.type}</div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
              {n.order_id && <a href={`/app/(dashboard)/driver/orders/${n.order_id}`} className="text-xs text-primary underline">View order</a>}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t p-2">
          <Button variant="ghost" size="sm" onClick={()=>markAllRead?.()}>Mark all as read</Button>
          <a className="text-xs text-primary underline" href="/app/(dashboard)/driver">View all</a>
        </div>
      </PopoverContent>
    </Popover>
  )
}
