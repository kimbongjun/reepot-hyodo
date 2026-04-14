"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  initialSettings: SiteSettings;
};

type Field = {
  key: keyof SiteSettings;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

const fieldGroups: Array<{
  title: string;
  description: string;
  fields: Field[];
}> = [
  {
    title: "기본 노출 설정",
    description: "이벤트 상단과 영상 섹션의 기본 정보를 관리합니다.",
    fields: [
      { key: "youtubeUrl", label: "유튜브 URL", placeholder: "https://www.youtube.com/watch?v=..." },
      { key: "eventNotice", label: "상단 안내 문구", multiline: true },
      { key: "heroTitle", label: "Hero 타이틀" },
      { key: "heroDescription", label: "Hero 설명", multiline: true },
      { key: "youtubeTitle", label: "영상 섹션 타이틀" },
      { key: "youtubeEmptyMessage", label: "영상 미등록 안내", multiline: true }
    ]
  },
  {
    title: "참여 섹션 문구",
    description: "참여 등록 폼과 실시간 댓글 피드의 핵심 문구를 조정합니다.",
    fields: [
      { key: "commentFormTitle", label: "참여 폼 타이틀" },
      { key: "commentFormDescription", label: "참여 폼 설명", multiline: true },
      { key: "commentFormSubmitLabel", label: "참여 버튼 문구" },
      { key: "commentFeedTitle", label: "댓글 피드 타이틀" },
      { key: "commentFeedEmptyMessage", label: "댓글 비어있음 안내", multiline: true }
    ]
  },
  {
    title: "혜택 섹션 문구",
    description: "하단 혜택 카드 제목과 설명을 관리자에서 직접 수정합니다.",
    fields: [
      { key: "benefitsTitle", label: "혜택 섹션 타이틀" },
      { key: "benefit1Title", label: "혜택 1 제목" },
      { key: "benefit1Description", label: "혜택 1 설명", multiline: true },
      { key: "benefit2Title", label: "혜택 2 제목" },
      { key: "benefit2Description", label: "혜택 2 설명", multiline: true },
      { key: "benefit3Title", label: "혜택 3 제목" },
      { key: "benefit3Description", label: "혜택 3 설명", multiline: true }
    ]
  }
];

export function YoutubeSettingsCard({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(name: keyof SiteSettings, value: string) {
    setSettings((current) => ({
      ...current,
      [name]: value
    }));
  }

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
          settings
        })
      });

      const result = (await response.json()) as Partial<SiteSettings> & {
        message?: string;
      };

      if (!response.ok) {
        setFeedback(result.message ?? "설정 저장에 실패했습니다.");
        return;
      }

      setSettings((current) => ({
        ...current,
        ...result
      }));
      setFeedback("이벤트 노출 문구와 유튜브 설정이 저장되었습니다.");
    });
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <CardTitle>이벤트 노출 문구 설정</CardTitle>
        <CardDescription>
          공개 페이지의 주요 텍스트를 관리자 화면에서 수정하고 즉시 반영할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {fieldGroups.map((group) => (
            <section key={group.title} className="space-y-4 rounded-2xl border border-brand/10 p-4">
              <div>
                <h3 className="text-base font-semibold text-black">{group.title}</h3>
                <p className="mt-1 text-sm leading-6 text-black/60">{group.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.fields.map((field) => (
                  <label
                    key={field.key}
                    className={`space-y-2 text-sm text-black ${
                      field.multiline ? "md:col-span-2" : ""
                    }`}
                  >
                    <span className="font-medium">{field.label}</span>
                    {field.multiline ? (
                      <textarea
                        value={settings[field.key] ?? ""}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-brand/12 bg-[#f7fbff] px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <Input
                        value={settings[field.key] ?? ""}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </label>
                ))}
              </div>
            </section>
          ))}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "저장 중..." : "설정 저장"}
            </Button>
            {feedback ? <p className="text-sm text-brand">{feedback}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
