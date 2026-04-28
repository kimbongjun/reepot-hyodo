import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  items: Array<{
    hour: number;
    count: number;
  }>;
};

export function HourlyChart({ items }: Props) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <CardTitle>시간대별 참여량</CardTitle>
        <CardDescription>
          작성 시각 기준으로 어느 시간대에 참여가 몰리는지 확인합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 items-end gap-2 md:grid-cols-[repeat(24,minmax(0,1fr))]">
          {items.map((item) => (
            <div key={item.hour} className="flex flex-col items-center gap-2">
              <div className="flex h-40 items-end">
                <div
                  className="w-3 rounded-full bg-[linear-gradient(180deg,#EDE4DA_0%,#DAC8B5_100%)]"
                  style={{
                    height: `${Math.max((item.count / max) * 100, item.count ? 10 : 2)}%`
                  }}
                />
              </div>
              <span className="text-[10px] font-medium text-black/45">
                {String(item.hour).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
