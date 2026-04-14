import type { SiteSettings } from "@/lib/types";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const SETTINGS_TABLE = "site_settings";
const YOUTUBE_KEY = "youtube_url";

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return { youtubeUrl: null };
  }

  const { data } = await supabase
    .from(SETTINGS_TABLE)
    .select("setting_key,setting_value")
    .eq("setting_key", YOUTUBE_KEY)
    .maybeSingle();

  return {
    youtubeUrl: data?.setting_value ?? null
  };
}

export async function updateYoutubeUrl(youtubeUrl: string | null) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const normalized = youtubeUrl?.trim() || null;

  const { error } = await supabase.from(SETTINGS_TABLE).upsert(
    {
      setting_key: YOUTUBE_KEY,
      setting_value: normalized
    },
    {
      onConflict: "setting_key"
    }
  );

  if (error) {
    throw error;
  }

  return {
    youtubeUrl: normalized
  };
}
