import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://nxsvaurnisprtbciwkno.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c3ZhdXJuaXNwcnRiY2l3a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTIwMTUsImV4cCI6MjA3MTcyODAxNX0.TLGuj7DeJHceRZCLd_wMqkaCTM26WOmL6j1oKl7U4bo',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { maxAge?: number; domain?: string; path?: string; secure?: boolean; httpOnly?: boolean; sameSite?: string }) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: { maxAge?: number; domain?: string; path?: string; secure?: boolean; httpOnly?: boolean; sameSite?: string }) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
