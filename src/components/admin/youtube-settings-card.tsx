"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  initialYoutubeUrl: string | null;
};

export function YoutubeSettingsCard({ initialYoutubeUrl }: Props) {
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutubeUrl ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim() || null
        })
      });

      const result = (await response.json()) as {
        youtubeUrl?: string | null;
        message?: string;
      };

      if (!response.ok) {
        setFeedback(result.message ?? "설정 저장에 실패했습니다.");
        return;
      }

      setYoutubeUrl(result.youtubeUrl ?? "");
      setFeedback("유튜브 URL이 저장되었습니다.");
    });
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <CardTitle>유튜브 영상 설정</CardTitle>
        <CardDescription>
          공개 페이지 상단에 노출할 유튜브 링크를 입력하세요. `youtube.com/watch`와
          `youtu.be` 형식을 모두 지원합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
          <Input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="md:flex-1"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </form>
        {feedback ? (
          <p className="mt-3 rounded-md bg-sky/20 px-3 py-2 text-sm text-brand">{feedback}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
