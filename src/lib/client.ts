"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  hasPublicSupabaseEnv,
  supabaseAnonKey,
  supabaseUrl
} from "@/lib/supabase/env";

export function createClient() {
  if (!hasPublicSupabaseEnv || !supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public environment variables are missing.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
