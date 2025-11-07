"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-gray-200 dark:bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-zinc-800" />
        </div>
        <div className="h-6 w-20 rounded bg-gray-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-xl border bg-white p-5 dark:bg-zinc-900">
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded" />))}
      </div>
      <Card className="rounded-xl border bg-white p-6 dark:bg-zinc-900">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-2">
          {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-5 w-full" />))}
        </div>
      </Card>
    </div>
  )
}
