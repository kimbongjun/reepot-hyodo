"use client";

import { createClient } from "@supabase/supabase-js";
import { hasPublicSupabaseEnv, supabaseAnonKey, supabaseUrl } from "./env";

export function createBrowserSupabaseClient() {
  if (!hasPublicSupabaseEnv || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
}
