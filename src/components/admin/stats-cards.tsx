import type { DashboardStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  stats: DashboardStats;
};

export function StatsCards({ stats }: Props) {
  const cards = [
    { label: "전체 참여", value: `${stats.totalCount}건` },
    { label: "오늘 참여", value: `${stats.todayCount}건` },
    { label: "고유 연락처", value: `${stats.uniquePhones}명` },
    { label: "고유 IP", value: `${stats.uniqueIps}개` },
    { label: "최다 지역", value: stats.topRegion },
    { label: "최다 시간대", value: stats.topTimezone }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-brand/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-[0.08em] text-black/45">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold leading-6 tracking-[-0.02em] text-black">
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
