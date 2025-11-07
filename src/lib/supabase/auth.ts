import type { Database, UserRow } from '@/types/database.types'
import type { CreateInput, UpdateInput, User } from '@/types'
import { parseSupabaseAuthError } from './errors'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function getClient() {
  // Always return a client-component client; these helpers are used on client.
  return createClientComponentClient<Database>()
}

/**
 * Auth helpers usable on both client and server.
 * For server usage in route handlers, prefer src/lib/supabase/api.ts helpers.
 */

function mapUserRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone ?? null,
    role: row.role as User['role'],
    avatar_url: row.avatar_url ?? null,
    is_active: Boolean(row.is_active ?? true),
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  }
}

export async function signUp(email: string, password: string, full_name: string, phone?: string) {
  try {
    const supabase = getClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    })
    if (authError) return { error: parseSupabaseAuthError(authError) as string }
    const userId = authData.user?.id
    if (!userId) return { error: 'Unable to create user.' }

    // Create profile row (role defaults to driver per RLS/migration expectations)
    const insert: CreateInput<UserRow> & { id: string } = {
      id: userId,
      email,
      full_name,
      phone: phone ?? null,
      role: 'driver',
      avatar_url: null,
      is_active: true,
    }
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert(insert)
      .select('*')
      .single()

    // If RLS prevents insert, surface a clear error
    if (profileError) return { error: profileError.message }

    return { data: mapUserRowToUser(profile) }
  } catch (e: any) {
    return { error: parseSupabaseAuthError(e) }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = getClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: parseSupabaseAuthError(error) as string }

    const uid = data.user?.id
    if (!uid) return { error: 'Login failed. No user.' }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single()

    if (profileError) return { error: profileError.message }
    return { data: mapUserRowToUser(profile) }
  } catch (e: any) {
    return { error: parseSupabaseAuthError(e) }
  }
}

export async function signOut() {
  try {
    const supabase = getClient()
    const { error } = await supabase.auth.signOut()
    if (error) return { error: parseSupabaseAuthError(error) as string }
    return { data: true }
  } catch (e: any) {
    return { error: parseSupabaseAuthError(e) }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = getClient()
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id
    if (!uid) return null
    const { data: profile } = await supabase.from('users').select('*').eq('id', uid).single()
    if (!profile) return null
    return mapUserRowToUser(profile)
  } catch {
    return null
  }
}

export async function updateUserProfile(userId: string, data: UpdateInput<User>) {
  try {
    const supabase = getClient()

    // Prevent role updates here (must be admin route-controlled)
    const { role, ...rest } = data as any

    const { data: updated, error } = await supabase
      .from('users')
      .update(rest)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) return { error: error.message }
    return { data: mapUserRowToUser(updated) }
  } catch (e: any) {
    return { error: parseSupabaseAuthError(e) }
  }
}

export async function resetPassword(email: string) {
  try {
    const supabase = getClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/reset-password`,
    })
    if (error) return { error: parseSupabaseAuthError(error) as string }
    return { data: true, message: 'Password reset email sent.' }
  } catch (e: any) {
    return { error: parseSupabaseAuthError(e) }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const supabase = getClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: parseSupabaseAuthError(error) as string }
    return { data: true }
  } catch (e: any) {
    return { error: parseSupabaseAuthError(e) }
  }
}
