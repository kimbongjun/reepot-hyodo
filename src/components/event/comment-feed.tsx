"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { sanitizeRealtimeComment } from "@/lib/comments";
import type { PublicComment } from "@/lib/types";

type Props = {
  initialComments: PublicComment[];
  title: string;
  emptyMessage: string;
};

const SCROLL_MARGIN_AFTER_INDEX = 5;
const DISPLAY_TIME_ZONE = "Asia/Seoul";

export function CommentFeed({ initialComments, title, emptyMessage }: Props) {
  const [comments, setComments] = useState(initialComments.filter((item) => !item.hidden));
  const [pendingLikes, setPendingLikes] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [focusedCommentId, setFocusedCommentId] = useState<string | null>(
    initialComments.find((item) => !item.hidden)?.id ?? null
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const articleRefs = useRef<Record<string, HTMLElement | null>>({});

  function upsertComment(nextItem: PublicComment, options?: { focus?: boolean }) {
    setComments((current) => {
      if (nextItem.hidden) {
        return current.filter((item) => item.id !== nextItem.id);
      }

      const index = current.findIndex((item) => item.id === nextItem.id);
      if (index >= 0) {
        const next = [...current];
        next[index] = {
          ...next[index],
          ...nextItem
        };
        return next;
      }

      return [nextItem, ...current].slice(0, 50);
    });

    if (options?.focus && !nextItem.hidden) {
      setFocusedCommentId(nextItem.id);
    }
  }

  function updateCommentLikeCount(commentId: string, likeCount: number) {
    setComments((current) =>
      current.map((item) =>
        item.id === commentId
          ? {
              ...item,
              like_count: likeCount
            }
          : item
      )
    );
  }

  async function handleLike(commentId: string) {
    if (pendingLikes[commentId]) {
      return;
    }

    const currentComment = comments.find((item) => item.id === commentId);
    if (!currentComment) {
      return;
    }

    const previousLikeCount = currentComment.like_count;

    setFeedback(null);
    setPendingLikes((current) => ({
      ...current,
      [commentId]: true
    }));
    updateCommentLikeCount(commentId, previousLikeCount + 1);

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST"
      });
      const result = (await response.json()) as {
        likeCount?: number;
        message?: string;
      };

      if (!response.ok || typeof result.likeCount !== "number") {
        throw new Error(result.message ?? "좋아요 처리에 실패했습니다.");
      }

      updateCommentLikeCount(commentId, result.likeCount);
    } catch (error) {
      updateCommentLikeCount(commentId, previousLikeCount);
      setFeedback(error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.");
    } finally {
      setPendingLikes((current) => ({
        ...current,
        [commentId]: false
      }));
    }
  }

  useEffect(() => {
    if (!focusedCommentId) {
      return;
    }

    const target = articleRefs.current[focusedCommentId];
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, [comments, focusedCommentId]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("public-comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "public_comments"
        },
        (payload) => {
          upsertComment(sanitizeRealtimeComment(payload.new), { focus: true });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "public_comments"
        },
        (payload) => {
          const nextItem = sanitizeRealtimeComment(payload.new);
          upsertComment(nextItem);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section
      id="comments"
      className="rounded-[1.8rem] border border-brand/20 bg-[linear-gradient(180deg,#393D42_0%,#4A4F56_100%)] p-6 text-white shadow-panel"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
            Live Comments
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-2xl font-black tracking-[-0.03em]">
            {title}
          </h2>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          {comments.length}개 표시 중
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {feedback ? (
          <div className="rounded-[1.2rem] border border-rose-200/40 bg-rose-500/15 px-4 py-3 text-sm text-white/92">
            {feedback}
          </div>
        ) : null}

        {comments.length ? (
          <div
            ref={scrollContainerRef}
            className="max-h-[35rem] space-y-3 overflow-y-auto pr-2"
            style={{
              scrollbarGutter: "stable"
            }}
          >
            {comments.map((comment, index) => (
              <article
                key={comment.id}
                ref={(node) => {
                  articleRefs.current[comment.id] = node;
                }}
                className={`rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur transition ${
                  focusedCommentId === comment.id ? "ring-2 ring-sky/60" : ""
                }`}
                style={
                  index < SCROLL_MARGIN_AFTER_INDEX
                    ? undefined
                    : {
                        scrollMarginTop: "1rem"
                      }
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-xl">{comment.nickname}</p>
                  <time className="text-xs text-white/60" suppressHydrationWarning>
                    {new Intl.DateTimeFormat("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: DISPLAY_TIME_ZONE
                    }).format(new Date(comment.created_at))}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-lg text-white/88">
                  {comment.message}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/55">응원 메시지에 좋아요를 눌러 주세요.</span>
                  <button
                    type="button"
                    onClick={() => handleLike(comment.id)}
                    disabled={Boolean(pendingLikes[comment.id])}
                    aria-label={`${comment.nickname} 댓글에 좋아요`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={comment.like_count > 0 ? "currentColor" : "none"}
                    />
                    <span>{comment.like_count}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}
