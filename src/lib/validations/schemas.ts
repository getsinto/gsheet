import { z } from 'zod'
import type { DeliveryWindow, DoorPosition, OrderStatus, UserRole } from '@/types'

// Common regex patterns
const phonePattern = /^\(\d{3}\)\s\d{3}-\d{4}$/ // (123) 456-7890
const zipPattern = /^\d{5}(-\d{4})?$/

const positiveDecimal = z
  .union([z.number(), z.string()])
  .refine((v) => {
    const n = typeof v === 'string' ? Number(v) : v
    return typeof n === 'number' && !Number.isNaN(n) && n > 0
  }, 'Must be a positive number')
  .transform((v) => (typeof v === 'string' ? Number(v) : v))

const positiveInt = z
  .union([z.number().int(), z.string()])
  .refine((v) => {
    const n = typeof v === 'string' ? Number(v) : v
    return Number.isInteger(n) && n > 0
  }, 'Must be a positive integer')
  .transform((v) => (typeof v === 'string' ? Number(v) : v))

const isoDateString = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date')

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z
  .object({
    full_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(phonePattern, 'Expected format: (123) 456-7890').optional().or(z.literal('').transform(() => undefined)),
    password: z
      .string()
      .min(8)
      .refine((v) => /[A-Z]/.test(v), 'Must include an uppercase letter')
      .refine((v) => /[a-z]/.test(v), 'Must include a lowercase letter')
      .refine((v) => /\d/.test(v), 'Must include a number'),
    confirm_password: z.string(),
  })
  .refine((vals) => vals.password === vals.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })

export const orderSchema = z.object({
  date: isoDateString,
  delivery_window: z.custom<DeliveryWindow>((v) => v === 'AM' || v === 'PM', {
    message: 'delivery_window must be AM or PM',
  }),
  driver_id: z.string().uuid(),
  driver_name: z.string().min(2),
  market: z.string().min(1),
  week_number: z.union([z.literal(1), z.literal(2)]),
  pickup_street: z.string().min(1),
  pickup_city: z.string().min(1),
  pickup_state: z.string().length(2),
  pickup_zip: z.string().regex(zipPattern, 'Invalid ZIP (12345 or 12345-1234)'),
  container_type: z.string().min(1),
  container_condition: z.string().optional().or(z.literal('').transform(() => undefined)),
  door_position: z
    .custom<DoorPosition>((v) => v === 'forward to cab' || v === 'away from cab')
    .optional(),
  release_number: z.string().optional().or(z.literal('').transform(() => undefined)),
  customer_name: z.string().min(1),
  customer_street: z.string().min(1),
  customer_city: z.string().min(1),
  customer_state: z.string().length(2),
  customer_zip: z.string().regex(zipPattern, 'Invalid ZIP'),
  customer_phone: z.string().regex(phonePattern, 'Expected format: (123) 456-7890'),
  miles: positiveInt,
  driver_pay: positiveDecimal,
  notes: z.string().optional().or(z.literal('').transform(() => undefined)),
  status: z
    .custom<OrderStatus>((v) =>
      v === 'dispatched' ||
      v === 'loaded' ||
      v === 'notified' ||
      v === 'delayed' ||
      v === 'cancelled' ||
      v === 'delivered'
    )
    .optional(),
})

export const updateOrderStatusSchema = z
  .object({
    status: z.custom<OrderStatus>((v) =>
      v === 'dispatched' ||
      v === 'loaded' ||
      v === 'notified' ||
      v === 'delayed' ||
      v === 'cancelled' ||
      v === 'delivered'
    ),
    status_reason: z.string().optional(),
    checkbox_name: z.enum([
      'is_dispatched',
      'is_loaded',
      'is_notified',
      'is_delayed',
      'is_cancelled',
      'is_delivered',
    ] as const),
    checkbox_value: z.boolean(),
  })
  .superRefine((vals, ctx) => {
    if ((vals.status === 'delayed' || vals.status === 'cancelled') && !vals.status_reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['status_reason'],
        message: 'status_reason is required when status is delayed or cancelled',
      })
    }
  })

export const userSchema = z
  .object({
    full_name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(phonePattern).optional().or(z.literal('').transform(() => undefined)),
    role: z.custom<UserRole>((v) => v === 'admin' || v === 'driver' || v === 'dispatcher'),
    password: z
      .string()
      .min(8)
      .refine((v) => /[A-Z]/.test(v), 'Must include an uppercase letter')
      .refine((v) => /[a-z]/.test(v), 'Must include a lowercase letter')
      .refine((v) => /\d/.test(v), 'Must include a number')
      .optional(),
  })

export const commentSchema = z.object({
  order_id: z.string().uuid(),
  comment: z.string().min(1).max(1000),
})

export const settingsSchema = z.object({
  company_name: z.string().min(1).optional(),
  default_pay_rate: positiveDecimal.optional(),
  current_week: z.union([z.literal(1), z.literal(2)]).optional(),
  container_types: z.array(z.string().min(1)).optional(),
  markets: z.array(z.string().min(1)).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type UserInput = z.infer<typeof userSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
