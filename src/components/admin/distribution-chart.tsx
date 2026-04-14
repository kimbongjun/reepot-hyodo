import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsBucket } from "@/lib/types";

type Props = {
  title: string;
  description: string;
  items: AnalyticsBucket[];
  accentClassName?: string;
};

export function DistributionChart({
  title,
  description,
  items,
  accentClassName = "bg-brand"
}: Props) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="truncate text-black/70">{item.label}</span>
                <span className="font-semibold text-black">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-[#eef6fb]">
                <div
                  className={`h-2 rounded-full ${accentClassName}`}
                  style={{ width: `${Math.max((item.count / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-brand/12 px-3 py-6 text-center text-sm text-black/45">
            수집된 분석 데이터가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
