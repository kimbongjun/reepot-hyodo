import type {
  AdminAnalytics,
  AnalyticsBucket,
  CommentFormInput,
  CommentRequestMeta,
  CommentSubmission,
  DashboardStats,
  PublicComment
} from "@/lib/types";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const PUBLIC_TABLE = "public_comments";
const ADMIN_TABLE = "comment_submissions";

function formatFrequencyLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized && normalized.length ? normalized : fallback;
}

function buildTopBuckets(
  items: CommentSubmission[],
  pick: (item: CommentSubmission) => string | null | undefined,
  fallback: string,
  limit = 6
): AnalyticsBucket[] {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const key = formatFrequencyLabel(pick(item), fallback);
    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function buildDuplicateBuckets(
  items: CommentSubmission[],
  pick: (item: CommentSubmission) => string | null | undefined,
  fallback: string,
  limit = 6
): AnalyticsBucket[] {
  return buildTopBuckets(items, pick, fallback, limit).filter((item) => item.count > 1);
}

function getMostFrequentLabel(
  items: CommentSubmission[],
  pick: (item: CommentSubmission) => string | null | undefined,
  fallback: string
) {
  return buildTopBuckets(items, pick, fallback, 1)[0]?.label ?? fallback;
}

const NICKNAME_MAX_LENGTH = 30;
const NAME_MAX_LENGTH = 20;
const MESSAGE_MIN_LENGTH = 2;
const MESSAGE_MAX_LENGTH = 500;

export function validateCommentInput(input: CommentFormInput) {
  const phone = input.phone.replace(/\D/g, "");
  const nickname = input.nickname.trim();
  const name = input.name.trim();
  const message = input.message.trim();

  if (!nickname || !name || !message) {
    return "닉네임, 이름, 메시지를 모두 입력해야 합니다.";
  }

  if (nickname.length > NICKNAME_MAX_LENGTH) {
    return `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (name.length > NAME_MAX_LENGTH) {
    return `이름은 ${NAME_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  if (phone.length < 10 || phone.length > 11) {
    return "연락처 형식이 올바르지 않습니다.";
  }

  if (message.length < MESSAGE_MIN_LENGTH) {
    return `메시지는 ${MESSAGE_MIN_LENGTH}자 이상 입력해 주세요.`;
  }

  if (message.length > MESSAGE_MAX_LENGTH) {
    return `메시지는 ${MESSAGE_MAX_LENGTH}자 이하로 입력해 주세요.`;
  }

  return null;
}

export async function getPublicComments(limit = 50): Promise<PublicComment[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(PUBLIC_TABLE)
    .select("id,nickname,message,like_count,hidden,created_at")
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function getAdminComments(limit = 500): Promise<CommentSubmission[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(ADMIN_TABLE)
    .select(
      "id,nickname,name,phone,hospital,message,like_count,hidden,created_at,ip_address,country,region,city,timezone,user_agent"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

export async function createCommentSubmission(
  input: CommentFormInput,
  meta: CommentRequestMeta
) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return {
      ok: false as const,
      message: "Supabase 환경변수가 설정되지 않았습니다."
    };
  }

  const validationError = validateCommentInput(input);
  if (validationError) {
    return {
      ok: false as const,
      message: validationError
    };
  }

  const payload = {
    nickname: input.nickname.trim(),
    name: input.name.trim(),
    phone: input.phone.replace(/\D/g, ""),
    hospital: input.hospital?.trim() || null,
    message: input.message.trim(),
    like_count: 0,
    hidden: false,
    ...meta
  };

  const { error } = await supabase.from(ADMIN_TABLE).insert(payload);

  if (error) {
    return {
      ok: false as const,
      message: error.message
    };
  }

  return {
    ok: true as const,
    message: "참여 내용이 등록되었습니다."
  };
}

export async function incrementCommentLike(
  commentId: string,
  ipAddress: string | null
): Promise<{ alreadyLiked: boolean; likeCount: number }> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const { data, error } = await supabase.rpc("increment_public_comment_like", {
    target_comment_id: commentId,
    voter_ip: ipAddress
  });

  if (error) {
    throw error;
  }

  const payload = data as unknown;
  if (typeof payload !== "object" || payload === null) {
    throw new Error("좋아요 수를 읽을 수 없습니다.");
  }
  const { already_liked, like_count } = payload as Record<string, unknown>;
  if (typeof already_liked !== "boolean" || typeof like_count !== "number") {
    throw new Error("좋아요 수를 읽을 수 없습니다.");
  }

  return { alreadyLiked: already_liked, likeCount: like_count };
}

export async function updateCommentHidden(commentId: string, hidden: boolean) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const { error: adminError } = await supabase
    .from(ADMIN_TABLE)
    .update({ hidden })
    .eq("id", commentId);
  if (adminError) {
    throw adminError;
  }
}

export async function deleteCommentSubmission(commentId: string) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  // DB trigger (comment_submissions_delete_public) cascades delete to public_comments automatically
  const { error } = await supabase.from(ADMIN_TABLE).delete().eq("id", commentId);
  if (error) {
    throw error;
  }
}

export function buildDashboardStats(items: CommentSubmission[]): DashboardStats {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul"
  });
  const todayKey = formatter.format(new Date());
  const totalLikes = items.reduce((sum, item) => sum + item.like_count, 0);
  const topLikedItem = items.reduce<CommentSubmission | null>((currentTop, item) => {
    if (!currentTop || item.like_count > currentTop.like_count) {
      return item;
    }

    return currentTop;
  }, null);

  const todayCount = items.filter(
    (item) => formatter.format(new Date(item.created_at)) === todayKey
  ).length;
  const uniqueIps = new Set(items.map((item) => item.ip_address).filter(Boolean)).size;

  return {
    totalCount: items.length,
    todayCount,
    totalLikes,
    averageLikes: items.length ? Number((totalLikes / items.length).toFixed(1)) : 0,
    uniquePhones: new Set(items.map((item) => item.phone)).size,
    uniqueIps,
    latestEntryAt: items[0]?.created_at ?? null,
    topLikedComment: topLikedItem
      ? {
          nickname: topLikedItem.nickname,
          likeCount: topLikedItem.like_count
        }
      : null,
    topRegion: getMostFrequentLabel(
      items,
      (item) => [item.country, item.region, item.city].filter(Boolean).join(" / "),
      "미확인 지역"
    ),
    topTimezone: getMostFrequentLabel(items, (item) => item.timezone, "미확인 시간대")
  };
}

export function buildAdminAnalytics(items: CommentSubmission[]): AdminAnalytics {
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0
  }));

  items.forEach((item) => {
    const hour = new Date(item.created_at).getHours();
    hourly[hour].count += 1;
  });

  const dailyFormatter = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit"
  });

  return {
    hourly,
    regions: buildTopBuckets(
      items,
      (item) => [item.country, item.region, item.city].filter(Boolean).join(" / "),
      "미확인 지역"
    ),
    timezones: buildTopBuckets(items, (item) => item.timezone, "미확인 시간대"),
    ipAddresses: buildTopBuckets(items, (item) => item.ip_address, "미확인 IP"),
    duplicatePhones: buildDuplicateBuckets(items, (item) => item.phone, "미확인 연락처"),
    daily: buildTopBuckets(
      items,
      (item) => dailyFormatter.format(new Date(item.created_at)),
      "미확인 일자",
      7
    )
  };
}

export function sanitizeRealtimeComment(row: Partial<CommentSubmission>): PublicComment {
  return {
    id: row.id ?? crypto.randomUUID(),
    nickname: row.nickname ?? "익명",
    message: row.message ?? "",
    like_count: row.like_count ?? 0,
    hidden: row.hidden ?? false,
    created_at: row.created_at ?? new Date().toISOString()
  };
}
