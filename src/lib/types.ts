export type PublicComment = {
  id: string;
  nickname: string;
  message: string;
  like_count: number;
  hidden: boolean;
  created_at: string;
};

export type CommentSubmission = PublicComment & {
  name: string;
  phone: string;
  hospital: string | null;
  ip_address: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  user_agent: string | null;
};

export type CommentFormInput = {
  nickname: string;
  name: string;
  phone: string;
  hospital: string;
  message: string;
};

export type CommentRequestMeta = {
  ip_address: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  user_agent: string | null;
};

export type DashboardStats = {
  totalCount: number;
  todayCount: number;
  totalLikes: number;
  averageLikes: number;
  uniquePhones: number;
  uniqueIps: number;
  latestEntryAt: string | null;
  topLikedComment: {
    nickname: string;
    likeCount: number;
  } | null;
  topRegion: string;
  topTimezone: string;
};

export type AnalyticsBucket = {
  label: string;
  count: number;
};

export type AdminAnalytics = {
  hourly: Array<{
    hour: number;
    count: number;
  }>;
  regions: AnalyticsBucket[];
  timezones: AnalyticsBucket[];
  ipAddresses: AnalyticsBucket[];
  duplicatePhones: AnalyticsBucket[];
  daily: AnalyticsBucket[];
};

export type VideoType = "youtube" | "mp4";

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoType: VideoType;
  videoUrl: string;
  labelText: string;
};

export function parseVideoItems(json: string): VideoItem[] {
  try {
    const parsed = JSON.parse(json || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((raw) => {
      const r = raw as Record<string, unknown>;
      return {
        id: String(r.id ?? ""),
        title: String(r.title ?? ""),
        description: String(r.description ?? ""),
        thumbnailUrl: String(r.thumbnailUrl ?? ""),
        videoType: r.videoType === "mp4" ? "mp4" : "youtube",
        videoUrl: String(r.videoUrl ?? ""),
        labelText: String(r.labelText ?? "")
      } satisfies VideoItem;
    }).filter((item) => item.id);
  } catch {
    return [];
  }
}

export type SiteSettings = {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  videoItems: string;
  eventNotice: string;
  heroTitle: string;
  heroDescription: string;
  commentFormTitle: string;
  commentFormDescription: string;
  commentFormSubmitLabel: string;
  commentFeedTitle: string;
  commentFeedEmptyMessage: string;
  eventCardsSectionTitle: string;
  eventCardsSectionDescription: string;
  eventCard1WinnerLabel: string;
  eventCard1ImageUrl: string | null;
  eventCard1Title: string;
  eventCard1Description: string;
  eventCard2WinnerLabel: string;
  eventCard2ImageUrl: string | null;
  eventCard2Title: string;
  eventCard2Description: string;
};
