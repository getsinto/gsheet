import type { OrderStatus } from "@/types"

/** Return Tailwind text color class for a status */
export function getStatusColor(status: OrderStatus | string): string {
  switch (String(status).toLowerCase()) {
    case 'dispatched': return 'text-yellow-600'
    case 'loaded': return 'text-green-600'
    case 'notified': return 'text-emerald-900'
    case 'delayed': return 'text-orange-600'
    case 'cancelled': return 'text-red-600'
    case 'delivered': return 'text-gray-600'
    default: return 'text-slate-500'
  }
}

/** Return Tailwind bg color class for a status */
export function getStatusBgColor(status: OrderStatus | string): string {
  switch (String(status).toLowerCase()) {
    case 'dispatched': return 'bg-yellow-100'
    case 'loaded': return 'bg-green-100'
    case 'notified': return 'bg-emerald-100'
    case 'delayed': return 'bg-orange-100'
    case 'cancelled': return 'bg-red-100'
    case 'delivered': return 'bg-gray-200'
    default: return 'bg-slate-100'
  }
}

/** Deterministic color for avatars based on a name hash */
export function getUserAvatarColor(name: string): string {
  const colors = ['#2563eb','#7c3aed','#db2777','#dc2626','#ea580c','#16a34a','#059669','#0ea5e9','#9333ea']
  let hash = 0
  for (let i=0;i<name.length;i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const idx = Math.abs(hash) % colors.length
  return colors[idx]
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const parsed = hex.replace('#','')
  const bigint = parseInt(parsed.length===3 ? parsed.split('').map(c=>c+c).join('') : parsed, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}

export function getContrastColor(bgColor: string): 'black' | 'white' {
  const { r, g, b } = hexToRgb(bgColor)
  const yiq = (r*299 + g*587 + b*114) / 1000
  return yiq >= 128 ? 'black' : 'white'
}
