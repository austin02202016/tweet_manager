// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Server-side logging
  console.log('\n=== Middleware Debug ===')
  console.log('URL:', req.url)
  console.log('Path:', req.nextUrl.pathname)
  console.log('Session exists:', !!session)
  console.log('Cookies:', req.cookies.getAll().map(c => c.name))
  console.log('=====================\n')

  // If we're on the login page, allow access regardless of session
  if (req.nextUrl.pathname === '/login') {
    return res
  }

  // For all other routes, require a Supabase session
  if (!session) {
    console.log('🔒 No Supabase session - Redirecting to login')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 