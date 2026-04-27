import type { SiteSettings } from "@/lib/types";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const SETTINGS_TABLE = "site_settings";

const SITE_SETTING_KEYS = {
  videoItems: "video_items",
  eventNotice: "event_notice",
  heroTitle: "hero_title",
  heroDescription: "hero_description",
  commentFormTitle: "comment_form_title",
  commentFormDescription: "comment_form_description",
  commentFormSubmitLabel: "comment_form_submit_label",
  commentFeedTitle: "comment_feed_title",
  commentFeedEmptyMessage: "comment_feed_empty_message",
  eventCardsSectionTitle: "event_cards_section_title",
  eventCardsSectionDescription: "event_cards_section_description",
  eventCard1WinnerLabel: "event_card_1_winner_label",
  eventCard1ImageUrl: "event_card_1_image_url",
  eventCard1Title: "event_card_1_title",
  eventCard1Description: "event_card_1_description",
  eventCard2WinnerLabel: "event_card_2_winner_label",
  eventCard2ImageUrl: "event_card_2_image_url",
  eventCard2Title: "event_card_2_title",
  eventCard2Description: "event_card_2_description"
} satisfies Record<keyof SiteSettings, string>;

export const defaultSiteSettings: SiteSettings = {
  videoItems: "[]",
  eventNotice:
    "`.env.local`에 Supabase 값을 넣고 `supabase/schema.sql`을 반영하면 실시간 댓글과 관리자 수집 기능까지 모두 동작합니다.",
  heroTitle: "리팟 효도 캠페인 이벤트",
  heroDescription: "MBN 동치미 본방송 시청 인증 이벤트",
  commentFormTitle: "실시간 참여 등록",
  commentFormDescription: "MBN 동치미 영상 시청 후 참여 정보를 작성해 주세요.",
  commentFormSubmitLabel: "참여 내용 등록하기",
  commentFeedTitle: "방금 등록된 참여 메시지",
  commentFeedEmptyMessage: "아직 등록된 메시지가 없습니다. 첫 참여 메시지를 남겨 보세요.",
  eventCardsSectionTitle: "",
  eventCardsSectionDescription: "",
  eventCard1WinnerLabel: "",
  eventCard1ImageUrl: null,
  eventCard1Title: "",
  eventCard1Description: "",
  eventCard2WinnerLabel: "",
  eventCard2ImageUrl: null,
  eventCard2Title: "",
  eventCard2Description: ""
};

function normalizeSettingValue(value: string | null | undefined) {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return defaultSiteSettings;

  const { data } = await supabase
    .from(SETTINGS_TABLE)
    .select("setting_key,setting_value")
    .in("setting_key", Object.values(SITE_SETTING_KEYS));

  const m = new Map(
    (data ?? []).map((item) => [item.setting_key, item.setting_value])
  );

  function get(key: keyof typeof SITE_SETTING_KEYS): string | null {
    return normalizeSettingValue(m.get(SITE_SETTING_KEYS[key]));
  }

  return {
    videoItems:                    get("videoItems")                    ?? defaultSiteSettings.videoItems,
    eventNotice:                   get("eventNotice")                   ?? defaultSiteSettings.eventNotice,
    heroTitle:                     get("heroTitle")                     ?? defaultSiteSettings.heroTitle,
    heroDescription:               get("heroDescription")               ?? defaultSiteSettings.heroDescription,
    commentFormTitle:              get("commentFormTitle")              ?? defaultSiteSettings.commentFormTitle,
    commentFormDescription:        get("commentFormDescription")        ?? defaultSiteSettings.commentFormDescription,
    commentFormSubmitLabel:        get("commentFormSubmitLabel")        ?? defaultSiteSettings.commentFormSubmitLabel,
    commentFeedTitle:              get("commentFeedTitle")              ?? defaultSiteSettings.commentFeedTitle,
    commentFeedEmptyMessage:       get("commentFeedEmptyMessage")       ?? defaultSiteSettings.commentFeedEmptyMessage,
    eventCardsSectionTitle:        get("eventCardsSectionTitle")        ?? defaultSiteSettings.eventCardsSectionTitle,
    eventCardsSectionDescription:  get("eventCardsSectionDescription")  ?? defaultSiteSettings.eventCardsSectionDescription,
    eventCard1WinnerLabel:         get("eventCard1WinnerLabel")         ?? defaultSiteSettings.eventCard1WinnerLabel,
    eventCard1ImageUrl:            get("eventCard1ImageUrl")            ?? defaultSiteSettings.eventCard1ImageUrl,
    eventCard1Title:               get("eventCard1Title")               ?? defaultSiteSettings.eventCard1Title,
    eventCard1Description:         get("eventCard1Description")         ?? defaultSiteSettings.eventCard1Description,
    eventCard2WinnerLabel:         get("eventCard2WinnerLabel")         ?? defaultSiteSettings.eventCard2WinnerLabel,
    eventCard2ImageUrl:            get("eventCard2ImageUrl")            ?? defaultSiteSettings.eventCard2ImageUrl,
    eventCard2Title:               get("eventCard2Title")               ?? defaultSiteSettings.eventCard2Title,
    eventCard2Description:         get("eventCard2Description")         ?? defaultSiteSettings.eventCard2Description
  };
}

export async function updateSiteSettings(input: Partial<SiteSettings>) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");

  const nextSettings = { ...defaultSiteSettings, ...input } satisfies SiteSettings;

  const payload = (Object.entries(SITE_SETTING_KEYS) as Array<
    [keyof SiteSettings, string]
  >).map(([field, settingKey]) => ({
    setting_key: settingKey,
    setting_value: normalizeSettingValue(nextSettings[field])
  }));

  const { error } = await supabase.from(SETTINGS_TABLE).upsert(payload, {
    onConflict: "setting_key"
  });

  if (error) throw error;
  return nextSettings;
}
