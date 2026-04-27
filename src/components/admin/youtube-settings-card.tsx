"use client";

import { useState, useTransition } from "react";
import type { SiteSettings, VideoType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  initialSettings: SiteSettings;
};

const TABS = [
  { id: "video",         label: "영상" },
  { id: "basic",         label: "기본 문구" },
  { id: "participation", label: "참여 섹션" },
  { id: "prize",         label: "경품 카드" },
  { id: "cta",           label: "CTA 링크" },
] as const;

type TabId = typeof TABS[number]["id"];

export function YoutubeSettingsCard({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState<TabId>("video");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(name: keyof SiteSettings, value: string) {
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  function setVideoType(type: VideoType) {
    setSettings((prev) => ({ ...prev, videoType: type }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
      });
      const result = (await res.json()) as Partial<SiteSettings> & { message?: string };
      if (!res.ok) {
        setFeedback(result.message ?? "설정 저장에 실패했습니다.");
        return;
      }
      setSettings((prev) => ({ ...prev, ...result }));
      setFeedback("설정이 저장되었습니다.");
    });
  }

  /* ── 필드 렌더 헬퍼 ── */
  function field(
    key: keyof SiteSettings,
    label: string,
    opts: { placeholder?: string; multiline?: boolean; rows?: number } = {}
  ) {
    const value = (settings[key] as string) ?? "";
    return (
      <label key={key} className={`block space-y-1.5 text-sm${opts.multiline ? " md:col-span-2" : ""}`}>
        <span className="font-medium text-black/75">{label}</span>
        {opts.multiline ? (
          <textarea
            value={value}
            onChange={(e) => set(key, e.target.value)}
            rows={opts.rows ?? 3}
            placeholder={opts.placeholder}
            spellCheck={false}
            className="w-full rounded-xl border border-brand/12 bg-[#f7fbff] px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => set(key, e.target.value)}
            placeholder={opts.placeholder}
          />
        )}
      </label>
    );
  }

  /* ── 서브섹션 래퍼 ── */
  function subsection(title: string, hint: string, children: React.ReactNode) {
    return (
      <div className="space-y-4 rounded-2xl border border-brand/8 bg-[#f9fcff] p-4">
        <div>
          <p className="text-sm font-semibold text-black">{title}</p>
          <p className="mt-0.5 text-xs leading-5 text-black/45">{hint}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      </div>
    );
  }

  /* ── 경품 카드 서브섹션 ── */
  function prizeCard(n: 1 | 2) {
    const w  = n === 1 ? "eventCard1WinnerLabel"  : "eventCard2WinnerLabel";
    const img = n === 1 ? "eventCard1ImageUrl"    : "eventCard2ImageUrl";
    const t  = n === 1 ? "eventCard1Title"        : "eventCard2Title";
    const d  = n === 1 ? "eventCard1Description"  : "eventCard2Description";
    return (
      <div className="space-y-4 rounded-2xl border border-brand/10 bg-white p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
            {n}
          </span>
          <p className="text-sm font-semibold text-black">경품 카드 {n}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {field(w,   "당첨 표기 (예: 1등 (1명))")}
          {field(img, "썸네일 이미지 URL", { placeholder: "https://..." })}
          {field(t,   "카드 타이틀")}
          {field(d,   "카드 설명", { multiline: true })}
        </div>
      </div>
    );
  }

  /* ── 탭별 콘텐츠 ── */
  function renderTabContent() {
    switch (activeTab) {

      case "video":
        return (
          <div className="space-y-5">
            {subsection(
              "영상 소스",
              "YouTube 또는 MP4 중 한 가지를 선택하고 URL을 입력합니다.",
              <>
                <div className="md:col-span-2">
                  <div className="inline-flex overflow-hidden rounded-xl border border-brand/12">
                    {(["youtube", "mp4"] as VideoType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVideoType(type)}
                        className={`px-5 py-2 text-sm font-medium transition-colors ${
                          settings.videoType === type
                            ? "bg-brand text-white"
                            : "bg-white text-black/55 hover:bg-[#f7fbff]"
                        }`}
                      >
                        {type === "youtube" ? "YouTube" : "MP4"}
                      </button>
                    ))}
                  </div>
                </div>
                {settings.videoType === "youtube"
                  ? field("youtubeUrl", "유튜브 URL", { placeholder: "https://www.youtube.com/watch?v=..." })
                  : field("mp4Url",     "MP4 URL",    { placeholder: "https://example.com/video.mp4" })
                }
              </>
            )}
            {subsection(
              "영상 섹션 문구",
              "공개 페이지의 영상 섹션 타이틀과 영상 미등록 시 안내 문구입니다.",
              <>
                {field("youtubeTitle",        "섹션 타이틀")}
                {field("youtubeEmptyMessage", "영상 없을 때 안내 문구", { multiline: true })}
              </>
            )}
          </div>
        );

      case "basic":
        return (
          <div className="space-y-5">
            {subsection(
              "상단 안내 배너",
              "이벤트 최상단에 표시되는 안내 문구입니다. Supabase 미연결 시에만 노출됩니다.",
              <>{field("eventNotice", "안내 문구", { multiline: true })}</>
            )}
            {subsection(
              "Hero 섹션",
              "메인 타이틀과 한 줄 설명 문구입니다.",
              <>
                {field("heroTitle",       "타이틀")}
                {field("heroDescription", "설명 문구", { multiline: true })}
              </>
            )}
          </div>
        );

      case "participation":
        return (
          <div className="space-y-5">
            {subsection(
              "참여 등록 폼",
              "이벤트 참여 폼의 타이틀·설명·버튼 문구입니다.",
              <>
                {field("commentFormTitle",       "폼 타이틀")}
                {field("commentFormSubmitLabel", "버튼 문구")}
                {field("commentFormDescription", "폼 설명",  { multiline: true })}
              </>
            )}
            {subsection(
              "실시간 피드",
              "참여 메시지 피드의 타이틀과 비어있을 때 안내 문구입니다.",
              <>
                {field("commentFeedTitle",        "피드 타이틀")}
                {field("commentFeedEmptyMessage", "비어있을 때 안내", { multiline: true })}
              </>
            )}
          </div>
        );

      case "prize":
        return (
          <div className="space-y-4">
            {subsection(
              "섹션 공통",
              "경품 카드 섹션 전체의 타이틀과 소개 문구입니다.",
              <>
                {field("eventCardsSectionTitle",       "섹션 타이틀")}
                {field("eventCardsSectionDescription", "섹션 설명",  { multiline: true })}
              </>
            )}
            {prizeCard(1)}
            {prizeCard(2)}
          </div>
        );

      case "cta":
        return (
          <div className="space-y-3">
            <p className="text-xs leading-5 text-black/45">
              명칭과 URL이 모두 입력된 항목만 공개 페이지에 노출됩니다.
            </p>
            {([1, 2, 3] as const).map((n) => {
              const lKey = `cta${n}Label` as keyof SiteSettings;
              const uKey = `cta${n}Url`   as keyof SiteSettings;
              return (
                <div key={n} className="grid gap-3 rounded-2xl border border-brand/8 bg-[#f9fcff] p-4 md:grid-cols-[1fr_2fr]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                      {n}
                    </span>
                    <Input
                      value={(settings[lKey] as string) ?? ""}
                      onChange={(e) => set(lKey, e.target.value)}
                      placeholder="링크 명칭"
                    />
                  </div>
                  <Input
                    value={(settings[uKey] as string) ?? ""}
                    onChange={(e) => set(uKey, e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              );
            })}
          </div>
        );
    }
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-4">
        <CardTitle>이벤트 페이지 설정</CardTitle>
        <CardDescription>
          공개 페이지의 영상·문구·경품 카드·링크를 탭별로 편집하고 한 번에 저장합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 탭 네비게이션 */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-brand/8 bg-[#f7fbff] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-sm"
                    : "text-black/45 hover:text-black/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div>{renderTabContent()}</div>

          {/* 저장 */}
          <div className="flex items-center gap-3 border-t border-brand/8 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "저장 중..." : "설정 저장"}
            </Button>
            {feedback && (
              <p className={`text-sm ${feedback.includes("실패") ? "text-red-500" : "text-brand"}`}>
                {feedback}
              </p>
            )}
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
