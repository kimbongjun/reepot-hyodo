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
  benefitsTitle: "benefits_title",
  benefit1Title: "benefit_1_title",
  benefit1Description: "benefit_1_description",
  benefit2Title: "benefit_2_title",
  benefit2Description: "benefit_2_description",
  benefit3Title: "benefit_3_title",
  benefit3Description: "benefit_3_description"
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
  benefitsTitle: "이벤트 참여 혜택",
  benefit1Title: "참여 즉시 노출",
  benefit1Description:
    "등록 직후 공개 피드에 반영되어 현장 참여감을 빠르게 끌어올립니다.",
  benefit2Title: "운영 데이터 분리",
  benefit2Description:
    "이름과 연락처는 관리자 화면에서만 관리하고 공개 화면에는 닉네임과 메시지만 보여줍니다.",
  benefit3Title: "캠페인 확장성",
  benefit3Description:
    "로고, 메시지, 핵심 문구만 바꾸면 다른 이벤트로도 유연하게 전환할 수 있습니다."
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
    benefitsTitle:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefitsTitle)) ??
      defaultSiteSettings.benefitsTitle,
    benefit1Title:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefit1Title)) ??
      defaultSiteSettings.benefit1Title,
    benefit1Description:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefit1Description)) ??
      defaultSiteSettings.benefit1Description,
    benefit2Title:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefit2Title)) ??
      defaultSiteSettings.benefit2Title,
    benefit2Description:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefit2Description)) ??
      defaultSiteSettings.benefit2Description,
    benefit3Title:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefit3Title)) ??
      defaultSiteSettings.benefit3Title,
    benefit3Description:
      normalizeSettingValue(settingsMap.get(SITE_SETTING_KEYS.benefit3Description)) ??
      defaultSiteSettings.benefit3Description
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
