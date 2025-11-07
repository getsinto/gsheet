"use client"

import React from "react"

export type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg"
  color?: string
  withText?: boolean
  text?: string
  className?: string
}

const sizeMap = { sm: 16, md: 24, lg: 36 }

export function LoadingSpinner({ size = "md", color = "currentColor", withText = false, text = "Loading...", className = "" }: LoadingSpinnerProps) {
  const px = sizeMap[size]
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <svg
        className="animate-spin"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.25" strokeWidth="4" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
      {withText && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}
