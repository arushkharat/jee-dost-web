import { createClient } from '@supabase/supabase-js';

// Using environment variables from the Secrets panel
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://niipepcinkxxckmemylc.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn("⚠️ Supabase Anon Key is missing! Please add VITE_SUPABASE_ANON_KEY to the Secrets panel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
