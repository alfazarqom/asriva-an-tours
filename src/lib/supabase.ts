import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  '';

export const isSupabaseConfigured = (): boolean =>
  Boolean(
    supabaseUrl &&
      supabasePublicKey &&
      !supabaseUrl.includes('your-project-ref') &&
      !supabasePublicKey.includes('your_publishable_key_here')
  );

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabasePublicKey)
  : null;
