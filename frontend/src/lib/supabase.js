import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pdrjjyznrjwjxgkkxdch.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcmpqeXpucmp3anhna2t4ZGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTEzMTQsImV4cCI6MjA4NzgyNzMxNH0.bbYlRRAPVIloh7TWAGzebtbCjeoqlo-glTUqCbtENZI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
