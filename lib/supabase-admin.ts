import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = 'https://nxsvaurnisprtbciwkno.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54c3ZhdXJuaXNwcnRiY2l3a25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE1MjAxNSwiZXhwIjoyMDcxNzI4MDE1fQ.nngNrcWUtqvaBAQyrhTrEkAjPfStVS4qgLKIryQMUzI'

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
