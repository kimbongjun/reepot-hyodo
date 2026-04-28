"use client";

import { useState, useTransition } from "react";
import type { SiteSettings, VideoItem, VideoType } from "@/lib/types";
import { parseVideoItems } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThumbnailUpload } from "./thumbnail-upload";

type Props = {
  initialSettings: SiteSettings;
};

const TABS = [
  { id: "video",         label: "영상" },
  { id: "basic",         label: "기본 문구" },
  { id: "participation", label: "참여 섹션" },
  { id: "prize",         label: "경품 카드" },
  { id: "seo",           label: "SEO / 메타" },
] as const;

type TabId = typeof TABS[number]["id"];

function makeId() {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function YoutubeSettingsCard({ initialSettings }: Props) {
  const [settings, setSettings]     = useState(initialSettings);
  const [activeTab, setActiveTab]   = useState<TabId>("video");
  const [feedback, setFeedback]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /* ── 공통 설정 필드 업데이트 ── */
  function set(name: keyof SiteSettings, value: string) {
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  /* ── 영상 아이템 관련 ── */
  const videoItems = parseVideoItems(settings.videoItems ?? "[]");

  function saveItems(items: VideoItem[]) {
    setSettings((prev) => ({ ...prev, videoItems: JSON.stringify(items) }));
  }

  function addItem() {
    saveItems([
      ...videoItems,
      { id: makeId(), title: "", description: "", thumbnailUrl: "", videoType: "youtube", videoUrl: "", labelText: "" }
    ]);
  }

  function removeItem(id: string) {
    saveItems(videoItems.filter((v) => v.id !== id));
  }

  function patchItem(id: string, patch: Partial<VideoItem>) {
    saveItems(videoItems.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  /* ── 폼 저장 ── */
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

  /* ── 텍스트 필드 헬퍼 ── */
  function textField(
    key: keyof SiteSettings,
    label: string,
    opts: { placeholder?: string; multiline?: boolean; rows?: number; html?: boolean } = {}
  ) {
    const value = (settings[key] as string) ?? "";
    return (
      <label key={key} className={`block space-y-1.5 text-sm${opts.multiline ? " md:col-span-2" : ""}`}>
        <span className="flex items-center gap-1.5 font-medium text-black/75">
          {label}
          {opts.html && (
            <span className="rounded-[0.35rem] border border-brand/15 bg-[#FAF7F2] px-1.5 py-0.5 text-[10px] font-bold text-brand/60">
              HTML
            </span>
          )}
        </span>
        {opts.multiline ? (
          <textarea
            value={value}
            onChange={(e) => set(key, e.target.value)}
            rows={opts.rows ?? 3}
            placeholder={opts.placeholder}
            spellCheck={false}
            className="w-full rounded-xl border border-brand/12 bg-[#FAF8F5] px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
          />
        ) : (
          <Input value={value} onChange={(e) => set(key, e.target.value)} placeholder={opts.placeholder} />
        )}
      </label>
    );
  }

  /* ── 서브섹션 래퍼 ── */
  function sub(title: string, hint: string, children: React.ReactNode) {
    return (
      <div className="space-y-4 rounded-2xl border border-brand/8 bg-[#FAF8F5] p-4">
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
    const w   = `eventCard${n}WinnerLabel`  as keyof SiteSettings;
    const img = `eventCard${n}ImageUrl`     as keyof SiteSettings;
    const t   = `eventCard${n}Title`        as keyof SiteSettings;
    const d   = `eventCard${n}Description`  as keyof SiteSettings;
    return (
      <div key={n} className="space-y-4 rounded-2xl border border-brand/10 bg-white p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
            {n}
          </span>
          <p className="text-sm font-semibold text-black">경품 카드 {n}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {textField(w,   "당첨 표기 (예: 1등 (1명))")}
          {textField(img, "썸네일 이미지 URL", { placeholder: "https://..." })}
          {textField(t,   "카드 타이틀")}
          {textField(d,   "카드 설명", { multiline: true, html: true })}
        </div>
      </div>
    );
  }

  /* ── 탭 콘텐츠 ── */
  function renderContent() {
    switch (activeTab) {

      /* 영상 탭 — 동적 아이템 관리 */
      case "video":
        return (
          <div className="space-y-3">
            {videoItems.length === 0 && (
              <p className="rounded-2xl border border-dashed border-brand/20 py-6 text-center text-sm text-black/40">
                등록된 영상이 없습니다. 아래 버튼으로 추가하세요.
              </p>
            )}

            {videoItems.map((item, index) => (
              <div
                key={item.id}
                className="space-y-4 rounded-2xl border border-brand/10 bg-white p-4"
              >
                {/* 아이템 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-xs font-black text-brand">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-black">영상 {index + 1}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-400 transition-colors hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* 타이틀 */}
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-black/75">타이틀</span>
                    <Input
                      value={item.title}
                      onChange={(e) => patchItem(item.id, { title: e.target.value })}
                      placeholder="영상 타이틀"
                    />
                  </label>

                  {/* 썸네일 업로드 */}
                  <div className="space-y-1.5">
                    <span className="block text-sm font-medium text-black/75">썸네일</span>
                    <ThumbnailUpload
                      value={item.thumbnailUrl}
                      onChange={(url) => patchItem(item.id, { thumbnailUrl: url })}
                    />
                  </div>

                  {/* 설명 — HTML 지원 */}
                  <label className="block space-y-1.5 text-sm md:col-span-2">
                    <span className="flex items-center gap-1.5 font-medium text-black/75">
                      설명
                      <span className="rounded-[0.35rem] border border-brand/15 bg-[#FAF7F2] px-1.5 py-0.5 text-[10px] font-bold text-brand/60">
                        HTML
                      </span>
                    </span>
                    <textarea
                      value={item.description}
                      onChange={(e) => patchItem(item.id, { description: e.target.value })}
                      rows={2}
                      spellCheck={false}
                      placeholder="설명 문구 또는 HTML 코드"
                      className="w-full rounded-xl border border-brand/12 bg-[#FAF8F5] px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
                    />
                  </label>

                  {/* 영상 타입 토글 */}
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-black/75">영상 타입</p>
                    <div className="inline-flex overflow-hidden rounded-xl border border-brand/12">
                      {(["youtube", "mp4"] as VideoType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => patchItem(item.id, { videoType: type })}
                          className={`px-4 py-2 text-sm font-medium transition-colors ${
                            item.videoType === type
                              ? "bg-brand text-white"
                              : "bg-white text-black/50 hover:bg-[#FAF8F5]"
                          }`}
                        >
                          {type === "youtube" ? "YouTube" : "MP4"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 영상 URL */}
                  <label className="block space-y-1.5 text-sm">
                    <span className="font-medium text-black/75">
                      {item.videoType === "youtube" ? "유튜브 URL" : "MP4 URL"}
                    </span>
                    <Input
                      value={item.videoUrl}
                      onChange={(e) => patchItem(item.id, { videoUrl: e.target.value })}
                      placeholder={
                        item.videoType === "youtube"
                          ? "https://www.youtube.com/watch?v=..."
                          : "https://example.com/video.mp4"
                      }
                    />
                  </label>

                  {/* 레이블 버튼 문구 */}
                  <label className="block space-y-1.5 text-sm md:col-span-2">
                    <span className="font-medium text-black/75">레이블 버튼 문구</span>
                    <Input
                      value={item.labelText}
                      onChange={(e) => patchItem(item.id, { labelText: e.target.value })}
                      placeholder="예: LIVE 방송 다시보기"
                    />
                    <p className="text-[11px] text-black/35">영상 우측 하단에 표시됩니다. 비워두면 숨겨집니다.</p>
                  </label>
                </div>
              </div>
            ))}

            {/* 추가 버튼 */}
            <button
              type="button"
              onClick={addItem}
              className="w-full rounded-2xl border border-dashed border-brand/20 py-3 text-sm font-medium text-brand/55 transition-colors hover:border-brand/40 hover:text-brand/80"
            >
              + 영상 추가
            </button>
          </div>
        );

      /* 기본 문구 탭 */
      case "basic":
        return (
          <div className="space-y-5">
            {sub(
              "상단 안내 배너",
              "이벤트 최상단에 표시되는 안내 문구입니다.",
              <>{textField("eventNotice", "안내 문구", { multiline: true })}</>
            )}
            {sub(
              "Hero 섹션",
              "메인 타이틀과 한 줄 설명 문구입니다.",
              <>
                {textField("heroTitle", "타이틀")}
                {textField("heroDescription", "설명 문구", { multiline: true, html: true })}
              </>
            )}
          </div>
        );

      /* 참여 섹션 탭 */
      case "participation":
        return (
          <div className="space-y-5">
            {sub(
              "참여 등록 폼",
              "이벤트 참여 폼의 타이틀·설명·버튼 문구입니다.",
              <>
                {textField("commentFormTitle",       "폼 타이틀")}
                {textField("commentFormSubmitLabel", "버튼 문구")}
                {textField("commentFormDescription", "폼 설명", { multiline: true, html: true })}
              </>
            )}
            {sub(
              "실시간 피드",
              "참여 메시지 피드의 타이틀과 빈 상태 안내 문구입니다.",
              <>
                {textField("commentFeedTitle",        "피드 타이틀")}
                {textField("commentFeedEmptyMessage", "비어있을 때 안내", { multiline: true })}
              </>
            )}
          </div>
        );

      /* 경품 카드 탭 */
      case "prize":
        return (
          <div className="space-y-4">
            {sub(
              "섹션 공통",
              "경품 카드 섹션 전체의 타이틀과 소개 문구입니다.",
              <>
                {textField("eventCardsSectionTitle",       "섹션 타이틀")}
                {textField("eventCardsSectionDescription", "섹션 설명", { multiline: true, html: true })}
              </>
            )}
            {prizeCard(1)}
            {prizeCard(2)}
          </div>
        );

      /* SEO / 메타 탭 */
      case "seo":
        return (
          <div className="space-y-5">
            {sub(
              "기본 메타 정보",
              "브라우저 탭 타이틀과 검색엔진·SNS 공유 시 표시되는 설명 문구입니다.",
              <>
                {textField("metaTitle",       "페이지 타이틀",   { placeholder: "리팟 효도 캠페인" })}
                {textField("metaDescription", "메타 설명 문구",  { multiline: true, rows: 2, placeholder: "SNS 공유 시 표시될 설명을 입력하세요." })}
              </>
            )}

            <div className="space-y-4 rounded-2xl border border-brand/8 bg-[#FAF8F5] p-4">
              <div>
                <p className="text-sm font-semibold text-black">OG 이미지</p>
                <p className="mt-0.5 text-xs leading-5 text-black/45">
                  SNS 공유 시 미리보기로 표시됩니다. 권장 크기: 1200×630 px
                </p>
              </div>
              <ThumbnailUpload
                value={settings.ogImageUrl ?? ""}
                onChange={(url) => set("ogImageUrl", url)}
              />
            </div>

            <div className="space-y-4 rounded-2xl border border-brand/8 bg-[#FAF8F5] p-4">
              <div>
                <p className="text-sm font-semibold text-black">파비콘</p>
                <p className="mt-0.5 text-xs leading-5 text-black/45">
                  브라우저 탭·북마크에 표시되는 아이콘입니다. PNG 권장, 최소 64×64 px
                </p>
              </div>
              <ThumbnailUpload
                value={settings.faviconUrl ?? ""}
                onChange={(url) => set("faviconUrl", url)}
              />
            </div>
          </div>
        );
    }
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-4">
        <CardTitle>이벤트 페이지 설정</CardTitle>
        <CardDescription>
          영상·문구·경품 카드를 탭별로 편집하고 한 번에 저장합니다. HTML 배지가 표시된 필드는 HTML 태그를 사용할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 탭 네비게이션 */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-brand/8 bg-[#FAF8F5] p-1">
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
          <div>{renderContent()}</div>

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
