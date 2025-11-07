import type { OrderStatus } from '@/types'

export type OrderFilters = {
  status?: OrderStatus[]
  driver_id?: string
  week_number?: 1 | 2
  start_date?: string
  end_date?: string
  search?: string
}

export function parseOrderFilters(searchParams: URLSearchParams): OrderFilters {
  const statusParam = searchParams.get('status')
  const status = statusParam
    ? (statusParam.split(',').map((s) => s.trim()).filter(Boolean) as OrderStatus[])
    : undefined
  const driver_id = searchParams.get('driver_id') ?? undefined
  const week_number = searchParams.get('week_number') ? (Number(searchParams.get('week_number')) as 1 | 2) : undefined
  const start_date = searchParams.get('start_date') ?? undefined
  const end_date = searchParams.get('end_date') ?? undefined
  const search = searchParams.get('search') ?? undefined
  return { status, driver_id, week_number, start_date, end_date, search }
}
