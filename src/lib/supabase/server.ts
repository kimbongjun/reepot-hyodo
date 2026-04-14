import { createClient } from "@supabase/supabase-js";
import {
  hasServiceSupabaseEnv,
  supabaseServiceKey,
  supabaseUrl
} from "./env";

export function createServiceSupabaseClient() {
  if (!hasServiceSupabaseEnv || !supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
