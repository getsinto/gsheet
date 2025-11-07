import { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { User } from '@/types'

// Create a Supabase client for Route Handlers.
// Prefer Bearer token (Authorization header) when present; otherwise fall back to cookies.
export function createRouteHandlerClient(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // First, try to read an Authorization: Bearer <token> header from the request.
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
  const match = authHeader?.match(/^Bearer\s+(.+)$/i)
  const bearer = match?.[1]
  if (bearer) {
    // Build a client that forwards the user's access token on every request so RLS applies.
    return createClient<Database>(url, anon, {
      global: {
        headers: { Authorization: `Bearer ${bearer}` },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  // Fallback: use cookies from the request (works when auth cookies are synced to the browser).
  return createServerClient<Database>(url, anon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      // No-ops for set/remove; Route Handlers typically don't need to mutate auth cookies.
      // If you need refresh token writes, wire these to a NextResponse in the handler.
      set(_name: string, _value: string, _options?: CookieOptions) {},
      remove(_name: string, _options?: CookieOptions) {},
    },
  })
}

export async function getCurrentUserFromRequest(req: NextRequest): Promise<User | null> {
  const supabase = createRouteHandlerClient(req)
  const { data } = await supabase.auth.getUser()
  const uid = data.user?.id
  if (!uid) return null
  const { data: profile } = await supabase.from('users').select('*').eq('id', uid).single()
  if (!profile) return null
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone ?? null,
    role: profile.role as User['role'],
    avatar_url: profile.avatar_url ?? null,
    is_active: Boolean(profile.is_active ?? true),
    created_at: profile.created_at ?? new Date().toISOString(),
    updated_at: profile.updated_at ?? new Date().toISOString(),
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req)
  if (!user) {
    return { error: { status: 401, message: 'Unauthorized' } as const, user: null as null }
  }
  return { user, error: null as null }
}

export async function requireAdmin(req: NextRequest) {
  const { user, error } = await requireAuth(req)
  if (error) return { user: null as null, error }
  if (user!.role !== 'admin') {
    return { user: null as null, error: { status: 403, message: 'Forbidden' } as const }
  }
  return { user: user!, error: null as null }
}
