"use client";

import { useState, useTransition } from "react";

const initialForm = {
  nickname: "",
  name: "",
  phone: "",
  hospital: "",
  message: ""
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
};

export function CommentForm({ title, description, submitLabel }: Props) {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = (await response.json()) as { message: string };
      setFeedback(result.message);

      if (response.ok) {
        setForm(initialForm);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[1.8rem] border border-brand/10 bg-white/88 p-6 shadow-panel backdrop-blur"
    >
      <div className="space-y-2">
        <h2 className="font-[var(--font-display)] text-2xl font-black tracking-[-0.03em] text-black">
          {title}
        </h2>
        {/* <p className="whitespace-pre-wrap text-sm leading-6 text-black/60">{description}</p> */}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm text-black">
          <span className="font-medium">닉네임</span>
          <input
            required
            maxLength={30}
            value={form.nickname}
            onChange={(event) => updateField("nickname", event.target.value)}
            className="w-full rounded-2xl border border-brand/12 bg-[#f7fbff] px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
            placeholder="공개 화면에 표시될 이름"
          />
        </label>

        <label className="space-y-2 text-sm text-black">
          <span className="font-medium">이름</span>
          <input
            required
            maxLength={20}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-2xl border border-brand/12 bg-[#f7fbff] px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
            placeholder="관리자 확인용 실명"
          />
        </label>

        <label className="space-y-2 text-sm text-black">
          <span className="font-medium">연락처</span>
          <input
            required
            maxLength={11}
            inputMode="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-2xl border border-brand/12 bg-[#f7fbff] px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
            placeholder="01012345678"
          />
        </label>

        <label className="space-y-2 text-sm text-black">
          <span className="font-medium">병원명</span>
          <input
            required
            value={form.hospital}
            onChange={(event) => updateField("hospital", event.target.value)}
            className="w-full rounded-2xl border border-brand/12 bg-[#f7fbff] px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
            placeholder="소속 병원명"
          />
        </label>

        <label className="space-y-2 text-sm text-black md:col-span-2">
          <span className="font-medium">메시지</span>
          <textarea
            required
            minLength={2}
            maxLength={500}
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-brand/12 bg-[#f7fbff] px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-sky/40"
            placeholder="이벤트에 참여하는 메시지를 남겨 주세요."
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#24304f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "등록 중..." : submitLabel}
      </button>

      {feedback ? (
        <p className="rounded-2xl bg-sky/30 px-4 py-3 text-sm font-medium text-brand">
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
