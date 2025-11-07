"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Number(value)))
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded bg-muted", className)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} role="progressbar">
      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}