export type PublicComment = {
  id: string;
  nickname: string;
  message: string;
  like_count: number;
  created_at: string;
};

export type CommentSubmission = PublicComment & {
  name: string;
  phone: string;
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
  uniquePhones: number;
  uniqueIps: number;
  latestEntryAt: string | null;
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

export type SiteSettings = {
  youtubeUrl: string | null;
};
