import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://nxsvaurnisprtbciwkno.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c3ZhdXJuaXNwcnRiY2l3a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTIwMTUsImV4cCI6MjA3MTcyODAxNX0.TLGuj7DeJHceRZCLd_wMqkaCTM26WOmL6j1oKl7U4bo',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
