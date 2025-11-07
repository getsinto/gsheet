import { AuthError } from '@supabase/supabase-js'

/** Convert Supabase auth errors to user-friendly strings */
export function parseSupabaseAuthError(err: unknown): string {
  if (!err) return 'Unknown error'
  const msg = typeof err === 'string' ? err : (err as any)?.message ?? 'Unknown error'

  if ((err as AuthError)?.status === 400) {
    // Common invalid credentials
    if (/Invalid login credentials/i.test(msg)) return 'Invalid email or password.'
  }

  if (/Email rate limit exceeded/i.test(msg)) return 'Too many attempts. Please try again later.'
  if (/Token expired/i.test(msg)) return 'Your session has expired. Please sign in again.'
  if (/Email not confirmed/i.test(msg)) return 'Please confirm your email before signing in.'

  return msg
}
