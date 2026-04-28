"use client";

import { useRef, useState } from "react";
import { parseVideoItems, type VideoItem } from "@/lib/types";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Props = {
  videoItemsJson: string;
};

type ThumbProps = {
  item: VideoItem;
  index: number;
  activeIndex: number;
  onSelect: (i: number) => void;
  fixedRatio?: boolean;
};

function ThumbItem({ item, index, activeIndex, onSelect, fixedRatio }: ThumbProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`relative w-full overflow-hidden rounded-[0.875rem] border transition-all duration-200 ${
        index === activeIndex
          ? "border-brand/40 shadow-md"
          : "border-brand/10 opacity-50 hover:opacity-80"
      }`}
    >
      <div className={`relative w-full ${fixedRatio ? "aspect-video" : ""}`}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-brand/30">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
        )}
        {index === activeIndex && (
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-brand" />
        )}
        {item.labelText && (
          <div className="pointer-events-none absolute right-1.5 top-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/15 bg-white/90 px-2 py-0.5 text-[13px] font-bold tracking-[-0.01em] text-[#3b3f44] shadow-sm backdrop-blur-sm">
              <span className={`h-1 w-1 rounded-full ${
        index === activeIndex
          ? "bg-[#DA5D60]"
          : "bg-[#8A6C8D]"
      }`}  />
              {item.labelText}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

const MOBILE_PER_PAGE = 2;
const SWIPE_THRESHOLD = 40;

export function YoutubeSection({ videoItemsJson }: Props) {
  const items = parseVideoItems(videoItemsJson);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobilePage, setMobilePage]   = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!items.length) return null;

  const clamped  = Math.min(activeIndex, items.length - 1);
  const active   = items[clamped];
  const embedUrl = active.videoType === "youtube" ? getYoutubeEmbedUrl(active.videoUrl || null) : null;
  const mp4Url   = active.videoType === "mp4" ? active.videoUrl : null;
  const hasVideo = active.videoType === "youtube" ? Boolean(embedUrl) : Boolean(mp4Url);

  const totalMobilePages = Math.ceil(items.length / MOBILE_PER_PAGE);

  function selectItem(i: number) {
    setActiveIndex(i);
    setMobilePage(Math.floor(i / MOBILE_PER_PAGE));
  }

  function goPage(p: number) {
    const next = Math.max(0, Math.min(totalMobilePages - 1, p));
    setMobilePage(next);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    goPage(delta > 0 ? mobilePage + 1 : mobilePage - 1);
  }

  return (
    <section className="rounded-[1.9rem] border border-brand/10 bg-white p-6 shadow-panel backdrop-blur md:p-8">

      {/* 현재 영상 헤더 */}
      {(active.title || active.description) && (
        <div className="mb-6 space-y-1.5">
          {active.title && (
            <h2 className="text-3xl font-black tracking-[-0.03em] text-black">
              {active.title}
            </h2>
          )}
          {active.description && (
            <div
              className="text-xl  text-black/55 break-keep"
              dangerouslySetInnerHTML={{ __html: active.description }}
            />
          )}
        </div>
      )}

      {/* 영상 플레이어 */}
      <div className="overflow-hidden rounded-[1.5rem] border border-brand/10 bg-[#FAF8F5]">
        {hasVideo ? (
          <div className="aspect-video">
            {active.videoType === "youtube" && embedUrl ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={active.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <video
                key={mp4Url}
                src={mp4Url ?? undefined}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm leading-6 text-black/40">
            관리자 화면에서 영상 URL을 입력하면 여기에 바로 반영됩니다.
          </div>
        )}
      </div>

      {/* 썸네일 탭 — 영상 2개 이상일 때만 */}
      {items.length > 1 && (
        <>
          {/* 모바일: 2개씩 캐러셀 + 스와이프 + 화살표 */}
          <div className="mt-4 md:hidden">
            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="grid grid-cols-2 gap-3">
                {Array.from(
                  { length: Math.min(MOBILE_PER_PAGE, items.length - mobilePage * MOBILE_PER_PAGE) },
                  (_, j) => {
                    const i = mobilePage * MOBILE_PER_PAGE + j;
                    return (
                      <ThumbItem
                        key={items[i].id}
                        item={items[i]}
                        index={i}
                        activeIndex={clamped}
                        onSelect={selectItem}
                        fixedRatio
                      />
                    );
                  }
                )}
              </div>

              {/* 화살표 — 이전 */}
              {mobilePage > 0 && (
                <button
                  type="button"
                  onClick={() => goPage(mobilePage - 1)}
                  className="absolute -left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-brand/15 bg-white shadow-sm"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand/60">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}

              {/* 화살표 — 다음 */}
              {mobilePage < totalMobilePages - 1 && (
                <button
                  type="button"
                  onClick={() => goPage(mobilePage + 1)}
                  className="absolute -right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-brand/15 bg-white shadow-sm"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand/60">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>

            {/* 페이지 도트 */}
            {totalMobilePages > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {Array.from({ length: totalMobilePages }, (_, p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goPage(p)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      p === mobilePage ? "w-4 bg-[#8A6C8D]" : "w-1.5 bg-[#8A6C8D]/25"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 데스크탑: 한 줄 flex, flex-1 균등 분할 */}
          <div className="mt-4 hidden gap-3 md:flex">
            {items.map((item, i) => (
              <div key={item.id} className="min-w-0 flex-1">
                <ThumbItem
                  item={item}
                  index={i}
                  activeIndex={clamped}
                  onSelect={selectItem}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
