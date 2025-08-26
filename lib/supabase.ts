import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = 'https://nxsvaurnisprtbciwkno.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c3ZhdXJuaXNwcnRiY2l3a25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNTIwMTUsImV4cCI6MjA3MTcyODAxNX0.TLGuj7DeJHceRZCLd_wMqkaCTM26WOmL6j1oKl7U4bo'

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
