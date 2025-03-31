import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlLength: supabaseUrl.length,
    keyLength: supabaseKey.length
  });
}

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseKey,
  {
    cookies: {
      get(name: string) {
        try {
          if (!isBrowser) return null;
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
          console.debug(`Getting cookie ${name}:`, cookie ? 'Found' : 'Not found');
          return cookie;
        } catch (error) {
          console.error('Error getting cookie:', error);
          return null;
        }
      },
      set(name: string, value: string, options: any) {
        try {
          if (!isBrowser) return;
          // Add SameSite and Secure attributes for better security and incognito compatibility
          const cookieOptions = [
            `path=/`,
            `max-age=${options.maxAge || 31536000}`,
            'SameSite=Lax',
            'Secure'
          ].join('; ');
          
          document.cookie = `${name}=${value}; ${cookieOptions}`;
          console.debug(`Setting cookie ${name}`);
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      remove(name: string, options: any) {
        try {
          if (!isBrowser) return;
          document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure`;
          console.debug(`Removing cookie ${name}`);
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: {
        // Use localStorage as a fallback if cookies are not available
        getItem: (key) => {
          try {
            if (!isBrowser) return null;
            return localStorage.getItem(key);
          } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            if (!isBrowser) return;
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error setting localStorage:', error);
          }
        },
        removeItem: (key) => {
          try {
            if (!isBrowser) return;
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing from localStorage:', error);
          }
        },
      },
    },
  }
) 