import type { PublicComment } from "@/lib/types";
import { HeroSection } from "./hero-section";
import { BenefitsSection } from "./benefits-section";
import { CommentForm } from "./comment-form";
import { CommentFeed } from "./comment-feed";
import { YoutubeSection } from "./youtube-section";

type Props = {
  initialComments: PublicComment[];
  isReady: boolean;
  youtubeUrl: string | null;
};

export function EventPage({ initialComments, isReady, youtubeUrl }: Props) {
  return (
    <main className="grain">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
        {!isReady ? (
          <div className="rounded-[1.5rem] border border-brand/15 bg-sky/25 px-5 py-4 text-sm font-medium leading-6 text-black/75">
            `.env.local`에 Supabase 값을 넣고 `supabase/schema.sql`을 반영하면 실시간
            댓글과 관리자 수집 기능까지 모두 동작합니다.
          </div>
        ) : null}

        <HeroSection />
        <YoutubeSection youtubeUrl={youtubeUrl} />

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <CommentForm />
          <CommentFeed initialComments={initialComments} />
        </div>

        <BenefitsSection />
      </div>
    </main>
  );
}
