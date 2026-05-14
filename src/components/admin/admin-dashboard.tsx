import type {
  AdminAnalytics,
  CommentSubmission,
  DashboardStats,
  SiteSettings
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyChart } from "./hourly-chart";
import { StatsCards } from "./stats-cards";
import { CommentsTable } from "./comments-table";
import { DistributionChart } from "./distribution-chart";
import { LogoutButton } from "./logout-button";
import { YoutubeSettingsCard } from "./youtube-settings-card";
import { AdminManagementCard } from "./admin-management-card";
import { PrivacyPolicyCard } from "./privacy-policy-card";

type Props = {
  comments: CommentSubmission[];
  stats: DashboardStats;
  analytics: AdminAnalytics;
  isReady: boolean;
  adminEmail: string;
  settings: SiteSettings;
};

export function AdminDashboard({
  comments,
  stats,
  analytics,
  isReady,
  adminEmail,
  settings
}: Props) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 md:px-8 md:py-8">
      <Card className="border-brand/10 bg-white/90 shadow-panel">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Admin Console</Badge>
                <Badge variant="secondary">{adminEmail}</Badge>
              </div>
              <div>
                <CardTitle className="text-3xl font-black tracking-[-0.04em]">
                  참여 데이터 운영 대시보드
                </CardTitle>
                <CardDescription className="mt-2 max-w-3xl leading-6">
                  실시간 참여 원본, 지역 분포, 시간대 추이, 반복 IP와 연락처 현황까지
                  한 화면에서 확인할 수 있도록 구성했습니다.
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-md border border-brand/12 bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#FAF8F5]"
              >
                공개 페이지
              </a>
              <LogoutButton />
            </div>
          </div>
        </CardHeader>
      </Card>

      {!isReady ? (
        <Card className="border-brand/10 bg-sky/15">
          <CardContent className="p-4 text-sm leading-6 text-black/70">
            Supabase 환경변수가 없어 데이터를 불러오지 못했습니다. `.env.local`과
            `supabase/schema.sql` 적용 상태를 먼저 확인해 주세요.
          </CardContent>
        </Card>
      ) : null}

      <StatsCards stats={stats} />
      <YoutubeSettingsCard initialSettings={settings} />
      <PrivacyPolicyCard initialSettings={settings} />
      <AdminManagementCard />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
        <HourlyChart items={analytics.hourly} />
        <DistributionChart
          title="지역 분포"
          description="국가, 지역, 도시 정보를 합쳐 주요 방문 지역을 집계합니다."
          items={analytics.regions}
          accentClassName="bg-brand"
        />
        <DistributionChart
          title="시간대 분포"
          description="Vercel IP timezone 헤더 기준 상위 시간대를 집계합니다."
          items={analytics.timezones}
          accentClassName="bg-sky"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DistributionChart
          title="반복 IP 상위"
          description="같은 IP에서 반복 제출한 현황을 빠르게 확인합니다."
          items={analytics.ipAddresses}
          accentClassName="bg-brand"
        />
        <DistributionChart
          title="중복 연락처 상위"
          description="중복 제출 또는 상담 이력 가능성이 있는 연락처를 추적합니다."
          items={analytics.duplicatePhones}
          accentClassName="bg-sky"
        />
        <DistributionChart
          title="최근 일자 추이"
          description="최근 유입 일자별 참여 건수를 간단히 비교합니다."
          items={analytics.daily}
          accentClassName="bg-brand"
        />
      </div>

      <CommentsTable comments={comments} />
    </main>
  );
}
