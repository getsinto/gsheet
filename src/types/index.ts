/**
 * Application-wide TypeScript enums, interfaces, and helper utility types.
 * For DB row/insert/update shapes, see src/types/database.types.ts
 */

// Enums (as string literal unions)
export type UserRole = 'admin' | 'driver' | 'dispatcher';
export type OrderStatus = 'dispatched' | 'loaded' | 'notified' | 'delayed' | 'cancelled' | 'delivered';
export type DeliveryWindow = 'AM' | 'PM';
export type DoorPosition = 'forward to cab' | 'away from cab';
export type NotificationType = 'order_assigned' | 'status_changed' | 'order_created' | 'order_delayed';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned';

// Utility Types
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'created_at'>>;

// Core entities
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  order_number: string;
  date: string; // ISO date string (YYYY-MM-DD)
  delivery_window: DeliveryWindow;
  driver_id: string | null;
  driver_name: string;
  market: string;
  week_number: 1 | 2;
  pickup_street: string;
  pickup_city: string;
  pickup_state: string;
  pickup_zip: string;
  container_type: string;
  container_condition: string | null;
  door_position: DoorPosition | null;
  release_number: string | null;
  customer_name: string;
  customer_street: string;
  customer_city: string;
  customer_state: string;
  customer_zip: string;
  customer_phone: string;
  driver_pay: number;
  miles: number;
  notes: string | null;
  status: OrderStatus;
  status_reason: string | null;
  is_dispatched: boolean;
  is_loaded: boolean;
  is_notified: boolean;
  is_delayed: boolean;
  is_cancelled: boolean;
  is_delivered: boolean;
  is_locked: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed/derived
  pickup_address: Address;
  customer_address: Address;
  driver: { id: string | null; name: string };
}

export interface OrderFormData {
  id?: string;
  date?: string;
  delivery_window?: DeliveryWindow;
  driver_id?: string;
  driver_name?: string;
  market?: string;
  week_number?: 1 | 2;
  pickup_address?: Address;
  customer_address?: Address;
  container_type?: string;
  container_condition?: string | null;
  door_position?: DoorPosition | null;
  release_number?: string | null;
  customer_phone?: string;
  miles?: number;
  driver_pay?: number;
  notes?: string | null;
  status?: OrderStatus;
  status_reason?: string | null;
  is_dispatched?: boolean;
  is_loaded?: boolean;
  is_notified?: boolean;
  is_delayed?: boolean;
  is_cancelled?: boolean;
  is_delivered?: boolean;
  is_locked?: boolean;
}

export interface OrderFilters {
  status?: OrderStatus[];
  driver_id?: string;
  week_number?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface OrderPhoto {
  id: string;
  order_id: string;
  photo_url: string;
  public_id: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface OrderComment {
  id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  order_id: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_orders: number;
  dispatched: number;
  loaded: number;
  delivered: number;
  delayed: number;
  cancelled: number;
  active_drivers: number;
  total_revenue: number;
  average_miles: number;
}

export interface DriverStats {
  driver_id: string;
  driver_name: string;
  total_orders: number;
  completed_orders: number;
  total_miles: number;
  total_earnings: number;
  on_time_rate: number; // 0..1
}

// Central exports
export * from './api';
export * from './database.types';
