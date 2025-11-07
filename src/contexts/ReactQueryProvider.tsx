"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'

let queryClient: QueryClient | null = null

function getClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
  }
  return queryClient
}

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const client = getClient()
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Remove in production if undesired */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  )
}
