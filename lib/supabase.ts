import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  cookies: {
    get(name: string) {
      if (typeof document === 'undefined') return ''
      const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`))
      return cookie ? cookie.split('=')[1] : ''
    },
    set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean }) {
      if (typeof document === 'undefined') return
      let cookie = `${name}=${value}`
      if (options.path) cookie += `; path=${options.path}`
      if (options.maxAge) cookie += `; max-age=${options.maxAge}`
      if (options.domain) cookie += `; domain=${options.domain}`
      cookie += `; SameSite=Lax`
      if (process.env.NODE_ENV === 'production') {
        cookie += `; Secure`
      }
      document.cookie = cookie
    },
    remove(name: string, options?: { path?: string }) {
      if (typeof document === 'undefined') return
      document.cookie = `${name}=; max-age=0${options?.path ? `; path=${options.path}` : ''}`
    },
  },
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storage: {
      getItem: (key: string) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
      },
      removeItem: (key: string) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
      },
    },
  },
}) 