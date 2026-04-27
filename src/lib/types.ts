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

export type SiteSettings = {
  videoType: VideoType;
  youtubeUrl: string | null;
  mp4Url: string | null;
  eventNotice: string;
  heroTitle: string;
  heroDescription: string;
  youtubeTitle: string;
  youtubeEmptyMessage: string;
  commentFormTitle: string;
  commentFormDescription: string;
  commentFormSubmitLabel: string;
  commentFeedTitle: string;
  commentFeedEmptyMessage: string;
  benefitsTitle: string;
  benefit1Title: string;
  benefit1Description: string;
  benefit2Title: string;
  benefit2Description: string;
  benefit3Title: string;
  benefit3Description: string;
};
