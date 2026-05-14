"use client";

import { useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SiteSettings } from "@/lib/types";

type Props = {
  initialSettings: SiteSettings;
};

type ToolbarButtonProps = {
  label: string;
  isActive?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, isActive, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brand text-white"
          : "text-black/50 hover:bg-white hover:text-black/80"
      }`}
    >
      {label}
    </button>
  );
}

export function PrivacyPolicyCard({ initialSettings }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
    ],
    content: initialSettings.privacyPolicy ?? "",
    editorProps: {
      attributes: {
        class: "min-h-[320px] px-4 py-3 outline-none privacy-editor-content",
      },
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const html = editor?.getHTML() ?? "";
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { privacyPolicy: html } }),
      });
      const result = (await res.json()) as Partial<SiteSettings> & { message?: string };
      if (!res.ok) {
        setFeedback(result.message ?? "저장에 실패했습니다.");
        return;
      }
      setFeedback("개인정보처리방침이 저장되었습니다.");
    });
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-4">
        <CardTitle>개인정보처리방침</CardTitle>
        <CardDescription>
          공개 페이지 하단 링크에서 표시될 개인정보처리방침 내용을 작성합니다.
          HTML 코드를 직접 붙여넣기 해도 됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-brand/12">
            {/* 툴바 */}
            <div className="flex flex-wrap gap-0.5 border-b border-brand/10 bg-[#FAF8F5] p-2">
              <ToolbarButton
                label="B"
                isActive={editor?.isActive("bold")}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                label="I"
                isActive={editor?.isActive("italic")}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton
                label="U"
                isActive={editor?.isActive("underline")}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              />
              <div className="mx-1.5 h-7 w-px self-center bg-brand/15" />
              <ToolbarButton
                label="H1"
                isActive={editor?.isActive("heading", { level: 1 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              />
              <ToolbarButton
                label="H2"
                isActive={editor?.isActive("heading", { level: 2 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              />
              <ToolbarButton
                label="H3"
                isActive={editor?.isActive("heading", { level: 3 })}
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              />
              <div className="mx-1.5 h-7 w-px self-center bg-brand/15" />
              <ToolbarButton
                label="• 목록"
                isActive={editor?.isActive("bulletList")}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              />
              <ToolbarButton
                label="1. 번호"
                isActive={editor?.isActive("orderedList")}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              />
              <div className="mx-1.5 h-7 w-px self-center bg-brand/15" />
              <ToolbarButton
                label="인용"
                isActive={editor?.isActive("blockquote")}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              />
              <ToolbarButton
                label="구분선"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              />
            </div>
            {/* 에디터 본문 */}
            <EditorContent editor={editor} className="bg-white" />
          </div>

          <div className="flex items-center gap-3 border-t border-brand/8 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "저장 중..." : "개인정보처리방침 저장"}
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
