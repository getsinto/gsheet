"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Truck, AlertTriangle, XCircle, Clock } from "lucide-react"
import type { OrderStatus } from "@/types"

export type StatusBadgeProps = {
  status: OrderStatus | string
  size?: "sm" | "md" | "lg"
  withIcon?: boolean
  className?: string
}

const map = {
  dispatched: { bg: "bg-yellow-500", text: "text-white", icon: Clock },
  loaded: { bg: "bg-green-500", text: "text-white", icon: Truck },
  notified: { bg: "bg-emerald-900", text: "text-white", icon: CheckCircle2 },
  delayed: { bg: "bg-orange-500", text: "text-white", icon: AlertTriangle },
  cancelled: { bg: "bg-red-600", text: "text-white", icon: XCircle },
  delivered: { bg: "bg-gray-500", text: "text-white", icon: CheckCircle2 },
} as const

export function StatusBadge({ status, size = "md", withIcon = false, className = "" }: StatusBadgeProps) {
  const key = String(status).toLowerCase() as keyof typeof map
  const cfg = map[key] || { bg: "bg-slate-400", text: "text-white", icon: Clock }
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-sm"
  const Icon = cfg.icon
  return (
    <Badge className={`${cfg.bg} ${cfg.text} ${px} ${className}`}>
      {withIcon && <Icon className="mr-1 h-4 w-4" />} {capitalize(String(status))}
    </Badge>
  )
}

function capitalize(s: string) { return s.charAt(0).toUpperCase()+s.slice(1) }
