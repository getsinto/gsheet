"use client"

import React from "react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong.</h1>
      <p className="max-w-md text-sm text-muted-foreground">{error?.message ?? "Unexpected error"}</p>
      <div className="flex items-center gap-3">
        <button onClick={reset} className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">Try again</button>
        <Link href="/" className="rounded border px-4 py-2 text-sm font-medium shadow hover:bg-gray-50 dark:hover:bg-zinc-800">Go to homepage</Link>
      </div>
    </div>
  )
}
