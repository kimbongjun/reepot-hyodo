"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { sanitizeRealtimeComment } from "@/lib/comments";
import type { PublicComment } from "@/lib/types";

type Props = {
  initialComments: PublicComment[];
};

export function CommentFeed({ initialComments }: Props) {
  const [comments, setComments] = useState(initialComments);

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
          const nextItem = sanitizeRealtimeComment(payload.new);
          setComments((current) => {
            if (current.some((item) => item.id === nextItem.id)) {
              return current;
            }

            return [nextItem, ...current].slice(0, 50);
          });
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
      className="rounded-[1.8rem] border border-brand/10 bg-[linear-gradient(180deg,#2d3b64_0%,#3d4d7a_100%)] p-6 text-white shadow-panel"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
            Live Comments
          </p>
          <h2 className="mt-2 font-[var(--font-display)] text-2xl font-black tracking-[-0.03em]">
            방금 등록된 참여 메시지
          </h2>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          {comments.length}개 표시 중
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {comments.length ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-bold">{comment.nickname}</p>
                <time className="text-xs text-white/60">
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "short",
                    timeStyle: "short"
                  }).format(new Date(comment.created_at))}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/88">
                {comment.message}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-[1.4rem] border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-white/70">
            아직 등록된 메시지가 없습니다. 첫 참여를 남겨 보세요.
          </div>
        )}
      </div>
    </section>
  );
}
