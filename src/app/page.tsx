import { EventPage } from "@/components/event/event-page";
import { getPublicComments } from "@/lib/comments";
import { getSiteSettings } from "@/lib/site-settings";
import { hasServiceSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
