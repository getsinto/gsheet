/** Array utilities */

export function groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const k = String(item[key])
    ;(acc[k] ||= []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export function sortBy<T extends Record<string, any>>(array: T[], key: keyof T, order: 'asc'|'desc' = 'asc'): T[] {
  return [...array].sort((a,b)=>{
    const av = a[key]; const bv = b[key]
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = av > bv ? 1 : av < bv ? -1 : 0
    return order==='asc'? cmp : -cmp
  })
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

export function chunk<T>(array: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i=0; i<array.length; i+=size) out.push(array.slice(i, i+size))
  return out
}
