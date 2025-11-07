import { NextResponse } from 'next/server'

export function jsonOk<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message }, { status: 200 })
}

export function jsonCreated<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message }, { status: 201 })
}

export function jsonError(message: string, status = 500, details?: unknown) {
  // Do not leak secrets; only include serializable, non-sensitive info
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[API ${status}]`, message, details ?? '')
  }
  return NextResponse.json({ success: false, error: message }, { status })
}

export type Paginate = { page: number; per_page: number; from: number; to: number }
export function parsePagination(searchParams: URLSearchParams, defaults = { page: 1, per_page: 50 }): Paginate {
  const page = Math.max(1, Number(searchParams.get('page') ?? defaults.page))
  const per_page = Math.min(200, Math.max(1, Number(searchParams.get('per_page') ?? defaults.per_page)))
  const from = (page - 1) * per_page
  const to = from + per_page - 1
  return { page, per_page, from, to }
}
