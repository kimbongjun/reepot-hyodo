import type { Metadata } from "next";
import { EventPage } from "@/components/event/event-page";
import { getPublicComments } from "@/lib/comments";
import { getSiteSettings } from "@/lib/site-settings";
import { hasServiceSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title       = settings.metaTitle       || "리팟 효도 캠페인";
  const description = settings.metaDescription || "";
  const faviconUrl  = settings.faviconUrl;
  const ogImageUrl  = settings.ogImageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {})
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {})
    },
    icons: faviconUrl
      ? { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl }
      : { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] }
  };
}

export default async function HomePage() {
  const [comments, settings] = await Promise.all([
    getPublicComments(),
    getSiteSettings()
  ]);

  return (
    <EventPage
      initialComments={comments}
      isReady={hasServiceSupabaseEnv}
      settings={settings}
    />
  );
}
