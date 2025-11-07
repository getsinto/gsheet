export function getWeekDates(weekNumber: number, year: number, weekStart: 'Mon'|'Sun' = 'Mon'): Date[] {
  // For a simple Week 1 / Week 2 rotation, derive weeks from current week range
  // Week 1: current week; Week 2: next week (fallback implementation)
  const today = new Date()
  const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const dow = weekStart === 'Mon' ? ((base.getUTCDay() + 6) % 7) : base.getUTCDay() // 0..6
  const start = new Date(base)
  start.setUTCDate(base.getUTCDate() - dow + (weekNumber === 1 ? 0 : 7))
  const arr: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    arr.push(d)
  }
  return arr
}

export function groupOrdersByDate<T extends { date: string }>(orders: T[]): Record<string, T[]> {
  const map: Record<string, T[]> = {}
  for (const o of orders) {
    const key = o.date
    if (!map[key]) map[key] = []
    map[key].push(o)
  }
  // sort within day by delivery window then customer
  for (const k of Object.keys(map)) {
    map[k].sort((a: any, b: any) => (a.delivery_window || '').localeCompare(b.delivery_window || '') || (a.customer_name || '').localeCompare(b.customer_name || ''))
  }
  return map
}

export function getOrdersByDay<T extends { date: string }>(orders: T[], date: Date): T[] {
  const iso = date.toISOString().slice(0,10)
  return orders.filter(o => o.date === iso)
}

export function sortOrdersByTime<T extends { delivery_window?: string }>(orders: T[]): T[] {
  return [...orders].sort((a,b) => (a.delivery_window || '').localeCompare(b.delivery_window || ''))
}

export function getDayOrderCount<T extends { date: string }>(orders: T[], date: Date): number {
  return getOrdersByDay(orders, date).length
}

export function isToday(date: Date): boolean {
  const now = new Date()
  return date.toDateString() === now.toDateString()
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear()===b.getUTCFullYear() && a.getUTCMonth()===b.getUTCMonth() && a.getUTCDate()===b.getUTCDate()
}

export function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
