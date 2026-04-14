"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  nextPath?: string;
  unauthorized?: boolean;
};

export function LoginForm({ nextPath = "/admin", unauthorized = false }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(
    unauthorized ? "관리자 권한이 있는 계정으로 로그인해 주세요." : null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setFeedback(error.message);
          return;
        }

        router.replace(nextPath);
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-black">이메일</label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-black">비밀번호</label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호 입력"
          required
        />
      </div>

      {feedback ? (
        <div className="rounded-md border border-brand/10 bg-sky/20 px-3 py-2 text-sm text-brand">
          {feedback}
        </div>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "로그인 중..." : "관리자 로그인"}
      </Button>
    </form>
  );
}
