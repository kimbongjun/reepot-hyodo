import { AdminDashboard } from "@/components/admin/admin-dashboard";
import {
  buildAdminAnalytics,
  buildDashboardStats,
  getAdminComments
} from "@/lib/comments";
import { requireAdminUser } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/site-settings";
import { hasServiceSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminUser = await requireAdminUser();
  const [comments, settings] = await Promise.all([
    getAdminComments(),
    getSiteSettings()
  ]);
  const stats = buildDashboardStats(comments);
  const analytics = buildAdminAnalytics(comments);

  return (
    <AdminDashboard
      comments={comments}
      stats={stats}
      analytics={analytics}
      isReady={hasServiceSupabaseEnv}
      adminEmail={adminUser.email ?? ""}
      settings={settings}
    />
  );
}
