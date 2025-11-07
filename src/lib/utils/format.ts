import { format as dfFormat, parseISO, formatDistanceToNow } from "date-fns"
import type { Address } from "@/types"

/** Format a number as USD currency, e.g. $1,234.56 */
export function formatCurrency(amount: number, currency: string = 'USD', locale?: string): string {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount ?? 0) } catch { return `$${(amount ?? 0).toFixed(2)}` }
}

/** Format a date with date-fns, default MMM dd, yyyy */
export function formatDate(date: string | Date, format: string = 'MMM dd, yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return dfFormat(d, format)
  } catch { return '' }
}

/** Format a US phone number as (555) 123-4567 */
export function formatPhone(phone: string): string {
  const d = (phone||'').replace(/\D+/g,'').slice(0,10)
  const p = [d.slice(0,3), d.slice(3,6), d.slice(6,10)]
  if (d.length<=3) return p[0]
  if (d.length<=6) return `(${p[0]}) ${p[1]}`
  return `(${p[0]}) ${p[1]}-${p[2]}`
}

/** Format address to a single line */
export function formatAddress(a: any): string {
  if (!a) return ''
  const parts = [a.street || a.line1, a.city, a.state, a.zip].filter(Boolean)
  if (parts.length>=3 && parts[2] && parts[3]) return `${parts[0]}, ${parts[1]}, ${parts[2]} ${parts[3]}`
  return parts.filter(Boolean).join(', ')
}

/** Truncate text to maxLength without breaking words */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length<=maxLength) return text || ''
  const sub = text.slice(0, maxLength)
  const last = Math.max(sub.lastIndexOf(' '), sub.lastIndexOf('\n'))
  return (last>0 ? sub.slice(0,last) : sub).trimEnd() + '…'
}

/** Derive initials from full name */
export function getInitials(name: string): string {
  const parts = (name||'').split(/\s+/).filter(Boolean)
  const [a,b] = [parts[0]?.[0], parts[parts.length-1]?.[0]]
  return (a||'').toUpperCase() + (b||'').toUpperCase()
}

/** Normalize order number to e.g. ON0001234 if digits are found */
export function formatOrderNumber(n: string, prefix: string = 'ON'): string {
  const digits = (n||'').replace(/\D+/g,'')
  if (!digits) return n
  return `${prefix}${digits.padStart(7,'0')}`
}

/** Relative time label like "2 hours ago" */
export function formatTimeAgo(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch { return '' }
}
