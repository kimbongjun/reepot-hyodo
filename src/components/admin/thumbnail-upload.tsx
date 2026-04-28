"use client";

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function ThumbnailUpload({ value, onChange }: Props) {
  const inputRef             = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]    = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      const res    = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await res.json()) as { url?: string; message?: string };

      if (!res.ok) throw new Error(result.message ?? "업로드에 실패했습니다.");
      onChange(result.url ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">

        {/* 미리보기 */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-brand/12 bg-[#FAF8F5] transition-colors hover:border-brand/30 disabled:opacity-50"
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-brand/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-medium">이미지</span>
            </div>
          )}
          {/* 호버 오버레이 */}
          {value && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <span className="text-[11px] font-semibold text-white">변경</span>
            </div>
          )}
        </button>

        {/* 텍스트 영역 */}
        <div className="min-w-0 space-y-1.5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-brand/15 bg-white px-4 py-2 text-sm font-medium text-black/65 transition-colors hover:border-brand/30 hover:bg-[#FAF8F5] disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                업로드 중...
              </span>
            ) : (
              value ? "이미지 변경" : "이미지 업로드"
            )}
          </button>
          <p className="text-[11px] text-black/35">JPG·PNG·WebP · 최대 5 MB</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
