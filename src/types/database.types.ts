// NOTE: This file should be regenerated from your live Supabase project.
// Run (replace with your project ref):
//   npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'driver' | 'dispatcher'
          avatar_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'admin' | 'driver' | 'dispatcher'
          avatar_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'driver' | 'dispatcher'
          avatar_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          date: string
          delivery_window: 'AM' | 'PM'
          driver_id: string | null
          driver_name: string
          market: string
          week_number: 1 | 2
          pickup_street: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          container_type: string
          container_condition: string | null
          door_position: 'forward to cab' | 'away from cab' | null
          release_number: string | null
          customer_name: string
          customer_street: string
          customer_city: string
          customer_state: string
          customer_zip: string
          customer_phone: string
          driver_pay: number
          miles: number
          notes: string | null
          status: 'dispatched' | 'loaded' | 'notified' | 'delayed' | 'cancelled' | 'delivered'
          status_reason: string | null
          is_dispatched: boolean | null
          is_loaded: boolean | null
          is_notified: boolean | null
          is_delayed: boolean | null
          is_cancelled: boolean | null
          is_delivered: boolean | null
          is_locked: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
          id?: string
          order_number?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['orders']['Row']>
        Relationships: [
          {
            foreignKeyName: 'orders_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      order_photos: {
        Row: {
          id: string
          order_id: string | null
          photo_url: string
          public_id: string
          uploaded_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          photo_url: string
          public_id: string
          uploaded_by?: string | null
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['order_photos']['Row']>
        Relationships: [
          {
            foreignKeyName: 'order_photos_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_photos_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      order_comments: {
        Row: {
          id: string
          order_id: string | null
          user_id: string | null
          user_name: string
          comment: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          user_name: string
          comment: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['order_comments']['Row']>
        Relationships: [
          {
            foreignKeyName: 'order_comments_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      order_activity_log: {
        Row: {
          id: string
          order_id: string | null
          user_id: string | null
          user_name: string
          action: string
          details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          user_id?: string | null
          user_name: string
          action: string
          details?: Json | null
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['order_activity_log']['Row']>
        Relationships: [
          {
            foreignKeyName: 'order_activity_log_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_activity_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_by: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_by?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['app_settings']['Row']>
        Relationships: [
          {
            foreignKeyName: 'app_settings_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'order_assigned' | 'status_changed' | 'order_created' | 'order_delayed' | null
          is_read: boolean | null
          order_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'order_assigned' | 'status_changed' | 'order_created' | 'order_delayed' | null
          is_read?: boolean | null
          order_id?: string | null
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Helper mapped types for convenience
export type Tables<TName extends keyof Database['public']['Tables']> = Database['public']['Tables'][TName]['Row'];
export type TablesInsert<TName extends keyof Database['public']['Tables']> = Database['public']['Tables'][TName]['Insert'];
export type TablesUpdate<TName extends keyof Database['public']['Tables']> = Database['public']['Tables'][TName]['Update'];

// Specific table row helpers
export type UserRow = Tables<'users'>;
export type OrderRow = Tables<'orders'>;
export type OrderPhotoRow = Tables<'order_photos'>;
export type OrderCommentRow = Tables<'order_comments'>;
export type OrderActivityLogRow = Tables<'order_activity_log'>;
export type NotificationRow = Tables<'notifications'>;
export type AppSettingsRow = Tables<'app_settings'>;
