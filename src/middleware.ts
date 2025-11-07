import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasSupabase = !!sbUrl && /^https?:\/\//.test(sbUrl) && !!sbKey
  if (!hasSupabase) {
    // Skip auth when env is not configured or invalid.
    return res
  }

  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session on each request
  await supabase.auth.getSession()

  const url = req.nextUrl
  const path = url.pathname

  const protectedPrefixes = ['/admin', '/dashboard', '/driver']
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p))
  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password'

  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user

  // Redirect authenticated users away from /login to their dashboard
  if (user && isAuthPage) {
    // Fetch role to route properly
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const target = profile?.role === 'admin' ? '/admin' : '/driver'
    return NextResponse.redirect(new URL(target, req.url))
  }

  // Protect protected routes
  if (isProtected && !user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only check for /admin
  if (path.startsWith('/admin') && user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
