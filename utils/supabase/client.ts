import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/db';
import { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient<Database> | undefined;

export const createClient = () => {
  if (client) {
    return client;
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
};