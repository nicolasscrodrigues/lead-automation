import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!cachedClient) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getEnv([
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);

    cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }

  return cachedClient;
}
