"use client"

import React from "react"
import Link from "next/link"
import { useNotifications } from "@/lib/hooks/useQueries"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, ExternalLink } from "lucide-react"

export function NotificationBell() {
  const { data, refetch } = useNotifications(5)
  const unread = data?.unread_count ?? 0
  const notifications = data?.notifications ?? []

  const markAll = async () => {
    await fetch("/api/notifications/mark-all-read", { method: "PATCH" })
    await refetch()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3">
          <div className="text-sm font-medium">Notifications</div>
          <button onClick={markAll} className="text-xs text-blue-600 hover:underline">
            <span className="inline-flex items-center gap-1"><CheckCheck className="h-3 w-3" /> Mark all read</span>
          </button>
        </div>
        <div className="max-h-80 divide-y overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">You're all caught up.</div>
          ) : (
            notifications.slice(0, 5).map((n: any) => (
              <div key={n.id} className="p-3 text-sm">
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground">{n.message}</div>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between p-3">
          <Link href="/admin/notifications" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
            View all <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
