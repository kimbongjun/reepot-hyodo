import { createClient } from "@supabase/supabase-js";
import {
  hasPublicSupabaseEnv,
  hasServiceSupabaseEnv,
  supabaseAnonKey,
  supabaseServiceKey,
  supabaseUrl
} from "./env";

export function createServerSupabaseClient() {
  if (!hasPublicSupabaseEnv || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

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
