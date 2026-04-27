import type { SiteSettings, VideoType } from "@/lib/types";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const SETTINGS_TABLE = "site_settings";

const SITE_SETTING_KEYS = {
  videoType: "video_type",
  youtubeUrl: "youtube_url",
  mp4Url: "mp4_url",
  eventNotice: "event_notice",
  heroTitle: "hero_title",
  heroDescription: "hero_description",
  youtubeTitle: "youtube_title",
  youtubeEmptyMessage: "youtube_empty_message",
  commentFormTitle: "comment_form_title",
  commentFormDescription: "comment_form_description",
  commentFormSubmitLabel: "comment_form_submit_label",
  commentFeedTitle: "comment_feed_title",
  commentFeedEmptyMessage: "comment_feed_empty_message",
  cta1Label: "cta_1_label",
  cta1Url: "cta_1_url",
  cta2Label: "cta_2_label",
  cta2Url: "cta_2_url",
  cta3Label: "cta_3_label",
  cta3Url: "cta_3_url",
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
  videoType: "youtube",
  youtubeUrl: null,
  mp4Url: null,
  eventNotice:
    "`.env.local`에 Supabase 값을 넣고 `supabase/schema.sql`을 반영하면 실시간 댓글과 관리자 수집 기능까지 모두 동작합니다.",
  heroTitle: "리팟 효도 캠페인 이벤트",
  heroDescription: "MBN 동치미 본방송 시청 인증 이벤트",
  youtubeTitle: "캠페인 영상",
  youtubeEmptyMessage:
    "아직 등록된 유튜브 영상이 없습니다. 관리자 화면에서 URL을 입력하면 여기에 바로 반영됩니다.",
  commentFormTitle: "실시간 참여 등록",
  commentFormDescription: "MBN 동치미 영상 시청 후 참여 정보를 작성해 주세요.",
  commentFormSubmitLabel: "참여 내용 등록하기",
  commentFeedTitle: "방금 등록된 참여 메시지",
  commentFeedEmptyMessage: "아직 등록된 메시지가 없습니다. 첫 참여 메시지를 남겨 보세요.",
  cta1Label: "",
  cta1Url: null,
  cta2Label: "",
  cta2Url: null,
  cta3Label: "",
  cta3Url: null,
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
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return defaultSiteSettings;
  }

  const { data } = await supabase
    .from(SETTINGS_TABLE)
    .select("setting_key,setting_value")
    .in("setting_key", Object.values(SITE_SETTING_KEYS));

  const settingsMap = new Map(
    (data ?? []).map((item) => [item.setting_key, item.setting_value])
  );

  const rawVideoType = normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.videoType));
  const videoType: VideoType =
    rawVideoType === "mp4" ? "mp4" : defaultSiteSettings.videoType;

  return {
    videoType,
    youtubeUrl:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.youtubeUrl)) ??
      defaultSiteSettings.youtubeUrl,
    mp4Url:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.mp4Url)) ??
      defaultSiteSettings.mp4Url,
    eventNotice:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventNotice)) ??
      defaultSiteSettings.eventNotice,
    heroTitle:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.heroTitle)) ??
      defaultSiteSettings.heroTitle,
    heroDescription:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.heroDescription)) ??
      defaultSiteSettings.heroDescription,
    youtubeTitle:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.youtubeTitle)) ??
      defaultSiteSettings.youtubeTitle,
    youtubeEmptyMessage:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.youtubeEmptyMessage)) ??
      defaultSiteSettings.youtubeEmptyMessage,
    commentFormTitle:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.commentFormTitle)) ??
      defaultSiteSettings.commentFormTitle,
    commentFormDescription:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.commentFormDescription)) ??
      defaultSiteSettings.commentFormDescription,
    commentFormSubmitLabel:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.commentFormSubmitLabel)) ??
      defaultSiteSettings.commentFormSubmitLabel,
    commentFeedTitle:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.commentFeedTitle)) ??
      defaultSiteSettings.commentFeedTitle,
    commentFeedEmptyMessage:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.commentFeedEmptyMessage)) ??
      defaultSiteSettings.commentFeedEmptyMessage,
    cta1Label:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.cta1Label)) ??
      defaultSiteSettings.cta1Label,
    cta1Url:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.cta1Url)) ??
      defaultSiteSettings.cta1Url,
    cta2Label:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.cta2Label)) ??
      defaultSiteSettings.cta2Label,
    cta2Url:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.cta2Url)) ??
      defaultSiteSettings.cta2Url,
    cta3Label:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.cta3Label)) ??
      defaultSiteSettings.cta3Label,
    cta3Url:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.cta3Url)) ??
      defaultSiteSettings.cta3Url,
    eventCardsSectionTitle:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCardsSectionTitle)) ??
      defaultSiteSettings.eventCardsSectionTitle,
    eventCardsSectionDescription:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCardsSectionDescription)) ??
      defaultSiteSettings.eventCardsSectionDescription,
    eventCard1WinnerLabel:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard1WinnerLabel)) ??
      defaultSiteSettings.eventCard1WinnerLabel,
    eventCard1ImageUrl:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard1ImageUrl)) ??
      defaultSiteSettings.eventCard1ImageUrl,
    eventCard1Title:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard1Title)) ??
      defaultSiteSettings.eventCard1Title,
    eventCard1Description:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard1Description)) ??
      defaultSiteSettings.eventCard1Description,
    eventCard2WinnerLabel:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard2WinnerLabel)) ??
      defaultSiteSettings.eventCard2WinnerLabel,
    eventCard2ImageUrl:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard2ImageUrl)) ??
      defaultSiteSettings.eventCard2ImageUrl,
    eventCard2Title:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard2Title)) ??
      defaultSiteSettings.eventCard2Title,
    eventCard2Description:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.eventCard2Description)) ??
      defaultSiteSettings.eventCard2Description
  };
}

export async function updateSiteSettings(input: Partial<SiteSettings>) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const nextSettings = {
    ...defaultSiteSettings,
    ...input,
    videoType: (input.videoType === "mp4" ? "mp4" : "youtube") satisfies VideoType,
    youtubeUrl: normalizeSettingValue(input.youtubeUrl ?? defaultSiteSettings.youtubeUrl),
    mp4Url: normalizeSettingValue(input.mp4Url ?? defaultSiteSettings.mp4Url)
  } satisfies SiteSettings;

  const payload = (Object.entries(SITE_SETTING_KEYS) as Array<
    [keyof SiteSettings, string]
  >).map(([field, settingKey]) => ({
    setting_key: settingKey,
    setting_value: normalizeSettingValue(nextSettings[field])
  }));

  const { error } = await supabase.from(SETTINGS_TABLE).upsert(payload, {
    onConflict: "setting_key"
  });

  if (error) {
    throw error;
  }

  return nextSettings;
}
