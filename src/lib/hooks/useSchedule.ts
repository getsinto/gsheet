"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { groupOrdersByDate } from "@/lib/utils/calendar"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useWeekOrders(weekNumber: 1|2, filters: { driver_ids: string[]; statuses: string[]; hideDelivered: boolean }) {
  const params = new URLSearchParams()
  params.set('week_number', String(weekNumber))
  if (filters.statuses.length) params.set('status', filters.statuses.join(','))
  if (filters.driver_ids.length) params.set('driver_id', filters.driver_ids[0]) // simple: single driver filter; extend to multi as needed
  const key = ["schedule","orders", weekNumber, params.toString(), filters.hideDelivered]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const data = await fetchJSON<any>(`/api/orders?${params.toString()}`)
      let list = data?.data ?? data ?? []
      if (filters.hideDelivered) list = list.filter((o: any) => o.status !== 'delivered')
      return groupOrdersByDate(list)
    },
    refetchInterval: 30_000,
    staleTime: 60_000,
  })
}

export function useUpdateOrderDate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule","orders"] }),
  })
}

export function useScheduleStats(weekNumber: 1|2) {
  const params = new URLSearchParams({ week_number: String(weekNumber) })
  return useQuery({
    queryKey: ["schedule","stats", weekNumber],
    queryFn: () => fetchJSON<any>(`/api/dashboard/stats?${params.toString()}`),
    staleTime: 5 * 60_000,
  })
}
