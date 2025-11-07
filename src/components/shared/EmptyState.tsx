"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded border p-6 text-center ${className}`}>
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="text-base font-semibold">{title}</div>
      {description && <div className="max-w-md text-sm text-muted-foreground">{description}</div>}
      {actionLabel && (
        <div className="pt-1">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}
