import type { User, Order } from "@/types"

export function isAdmin(user?: User | null): boolean {
  return (user as any)?.role === 'admin'
}

export function isDriver(user?: User | null): boolean {
  return (user as any)?.role === 'driver'
}

export function canManageUsers(user?: User | null): boolean {
  return isAdmin(user)
}

export function canChangeSettings(user?: User | null): boolean {
  return isAdmin(user)
}

export function canDeleteOrder(user?: User | null): boolean {
  return isAdmin(user)
}

export function canEditOrder(user: User | null | undefined, order: Order | any): boolean {
  if (isAdmin(user)) return true
  if (isDriver(user)) return order?.driver_id === (user as any)?.id && order?.status !== 'delivered'
  return false
}

export function canViewOrder(user: User | null | undefined, order: Order | any): boolean {
  if (isAdmin(user)) return true
  if (isDriver(user)) return order?.driver_id === (user as any)?.id
  return false
}
