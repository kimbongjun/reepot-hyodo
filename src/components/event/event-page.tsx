import type { PublicComment, SiteSettings } from "@/lib/types";
import { HeroSection } from "./hero-section";
import { BenefitsSection } from "./benefits-section";
import { FooterSection } from "./footer-section";
import { CommentForm } from "./comment-form";
import { CommentFeed } from "./comment-feed";
import { YoutubeSection } from "./youtube-section";

type Props = {
  initialComments: PublicComment[];
  isReady: boolean;
  settings: SiteSettings;
};

export function EventPage({ initialComments, isReady, settings }: Props) {
  return (
    <main className="grain">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
        {!isReady ? (
          <div className="rounded-[1.5rem] border border-brand/15 bg-sky/25 px-5 py-4 text-sm font-medium leading-6 text-black/75">
            {settings.eventNotice}
          </div>
        ) : null}

        <HeroSection title={settings.heroTitle} description={settings.heroDescription} />

        <YoutubeSection
          title={settings.youtubeTitle}
          emptyMessage={settings.youtubeEmptyMessage}
          youtubeUrl={settings.youtubeUrl}
        />

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <CommentForm
            title={settings.commentFormTitle}
            description={settings.commentFormDescription}
            submitLabel={settings.commentFormSubmitLabel}
          />
          <CommentFeed
            initialComments={initialComments}
            title={settings.commentFeedTitle}
            emptyMessage={settings.commentFeedEmptyMessage}
          />
        </div>

        <BenefitsSection
          title={settings.benefitsTitle}
          items={[
            {
              title: settings.benefit1Title,
              description: settings.benefit1Description
            },
            {
              title: settings.benefit2Title,
              description: settings.benefit2Description
            },
            {
              title: settings.benefit3Title,
              description: settings.benefit3Description
            }
          ]}
        />               
      </div>
      <FooterSection title="COPYRIGHT Ⓒ 2026 CLASSYS ALL RIGHTS RESERVED." />
    </main>
  );
}
