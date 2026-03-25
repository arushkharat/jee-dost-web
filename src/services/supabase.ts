import { createClient } from '@supabase/supabase-js'

const meta = import.meta as any;
const supabaseUrl = meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) console.error('Error logging in:', error.message)
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error logging out:', error.message)
}
