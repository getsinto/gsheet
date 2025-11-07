"use client"

import { useMemo } from "react"

export function useOrderSearch<T extends Record<string, any>>(orders: T[], searchTerm: string) {
  const filtered = useMemo(() => {
    if (!searchTerm) return orders
    const q = searchTerm.toLowerCase()
    return orders.filter((o) => {
      const hay = [
        o.order_number,
        o.customer_name,
        o.driver_name,
        o.pickup_street, o.pickup_city, o.pickup_state, o.pickup_zip,
        o.customer_street, o.customer_city, o.customer_state, o.customer_zip,
        o.customer_phone,
      ].map((x) => String(x ?? "").toLowerCase()).join(" ")
      return hay.includes(q)
    })
  }, [orders, searchTerm])

  return filtered
}
