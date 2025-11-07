"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export type LoadingSkeletonProps = {
  variant?: "text" | "card" | "table" | "circle"
  lines?: number
  className?: string
}

export function LoadingSkeleton({ variant = "card", lines = 3, className = "" }: LoadingSkeletonProps) {
  if (variant === "text") {
    return (
      <div className={`space-y-2 ${className}`} aria-busy>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    )
  }
  if (variant === "circle") {
    return <Skeleton className={`h-12 w-12 rounded-full ${className}`} />
  }
  if (variant === "table") {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-6 w-1/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }
  // card
  return <Skeleton className={`h-24 w-full ${className}`} />
}
