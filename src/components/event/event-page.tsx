import type { PublicComment, SiteSettings } from "@/lib/types";
import { HeroSection } from "./hero-section";
import { BenefitsSection } from "./benefits-section";
import { CtaSection } from "./cta-section";
import { EventCardsSection } from "./event-cards-section";
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
          videoType={settings.videoType}
          youtubeUrl={settings.youtubeUrl}
          mp4Url={settings.mp4Url}
        />
       
        <CtaSection
          items={[
            { label: settings.cta1Label, url: settings.cta1Url ?? "" },
            { label: settings.cta2Label, url: settings.cta2Url ?? "" },
            { label: settings.cta3Label, url: settings.cta3Url ?? "" }
          ].filter((item) => item.label && item.url)}
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

        <EventCardsSection
          sectionTitle={settings.eventCardsSectionTitle}
          sectionDescription={settings.eventCardsSectionDescription}
          cards={[
            {
              winnerLabel: settings.eventCard1WinnerLabel,
              imageUrl: settings.eventCard1ImageUrl,
              title: settings.eventCard1Title,
              description: settings.eventCard1Description
            },
            {
              winnerLabel: settings.eventCard2WinnerLabel,
              imageUrl: settings.eventCard2ImageUrl,
              title: settings.eventCard2Title,
              description: settings.eventCard2Description
            }
          ]}
        />
      </div>
      <FooterSection title="COPYRIGHT Ⓒ 2026 CLASSYS ALL RIGHTS RESERVED." />
    </main>
  );
}
