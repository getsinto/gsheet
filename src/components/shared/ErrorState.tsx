"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export type ErrorStateProps = {
  message?: string
  onRetry?: () => void
  onBack?: () => void
  details?: string
  className?: string
}

export function ErrorState({ message = "Something went wrong.", onRetry, onBack, details, className = "" }: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false)
  return (
    <div className={`flex min-h-[160px] flex-col items-center justify-center gap-3 rounded border p-6 text-center ${className}`} role="alert">
      <AlertCircle className="h-6 w-6 text-red-600" />
      <div className="text-base font-semibold">{message}</div>
      {details && (
        <button className="text-xs text-muted-foreground underline" onClick={()=>setShowDetails(v=>!v)}>{showDetails? 'Hide details':'Show details'}</button>
      )}
      {showDetails && details && (
        <pre className="max-w-full overflow-auto rounded bg-muted p-2 text-left text-xs text-muted-foreground">{details}</pre>
      )}
      <div className="flex gap-2 pt-1">
        {onRetry && <Button onClick={onRetry}>Try Again</Button>}
        {onBack && <Button variant="outline" onClick={onBack}>Go Back</Button>}
      </div>
    </div>
  )
}
