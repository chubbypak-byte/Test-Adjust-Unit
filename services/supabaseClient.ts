import { createClient } from '@supabase/supabase-js';

// Use fallback values to prevent "supabaseUrl is required" error during initialization
// if environment variables are not set. This allows the app to load even if DB is not configured.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);