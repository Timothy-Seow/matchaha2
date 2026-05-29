// matcha-haha — shared Supabase client
// Replace the two placeholders with values from your Supabase project
// (Dashboard → Settings → API). The anon key is safe to ship in browser JS;
// Row Level Security policies in schema.sql protect the data.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL      = 'https://qschgqucwolhhkplvcld.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY2hncXVjd29saGhrcGx2Y2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDE2MjYsImV4cCI6MjA5NTI3NzYyNn0.2nWpd4qfKHFRA2NxpPZi5Xf6Q1uXvNJfjd7rlfwKRHQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // needed for OAuth redirect handling
  },
});
