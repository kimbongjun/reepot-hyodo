"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminData = {
  dbAdmins: string[];
  envAdmins: string[];
};

export function AdminManagementCard() {
  const [data, setData] = useState<AdminData>({ dbAdmins: [], envAdmins: [] });
  const [newEmail, setNewEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/admin/admins")
      .then((res) => res.json() as Promise<AdminData>)
      .then(setData)
      .catch(() => null);
  }, []);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail })
      });

      const result = (await res.json()) as { email?: string; message?: string };

      if (!res.ok) {
        setFeedback(result.message ?? "추가에 실패했습니다.");
        return;
      }

      setNewEmail("");
      setData((prev) => ({
        ...prev,
        dbAdmins: prev.dbAdmins.includes(result.email!)
          ? prev.dbAdmins
          : [...prev.dbAdmins, result.email!]
      }));
      setFeedback(`${result.email} 관리자가 추가되었습니다.`);
    });
  }

  function handleDelete(email: string) {
    setFeedback(null);

    startTransition(async () => {
      const res = await fetch(`/api/admin/admins/${encodeURIComponent(email)}`, {
        method: "DELETE"
      });

      const result = (await res.json()) as { email?: string; message?: string };

      if (!res.ok) {
        setFeedback(result.message ?? "삭제에 실패했습니다.");
        return;
      }

      setData((prev) => ({
        ...prev,
        dbAdmins: prev.dbAdmins.filter((e) => e !== email)
      }));
      setFeedback(`${email} 관리자가 삭제되었습니다.`);
    });
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <CardTitle>관리자 계정 관리</CardTitle>
        <CardDescription>
          관리자 이메일을 추가하거나 삭제합니다. 환경변수로 등록된 계정은 읽기 전용입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 환경변수 관리자 */}
        {data.envAdmins.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-brand/10 p-4">
            <div>
              <h3 className="text-sm font-semibold text-black">시스템 관리자 (ENV)</h3>
              <p className="mt-1 text-xs leading-5 text-black/50">
                환경변수 <code className="rounded bg-[#f7fbff] px-1 py-0.5">ADMIN_EMAILS</code>로 등록된 계정입니다. 수정하려면 환경변수를 직접 변경하세요.
              </p>
            </div>
            <ul className="space-y-2">
              {data.envAdmins.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between rounded-xl border border-brand/8 bg-[#f7fbff] px-4 py-2.5 text-sm text-black/70"
                >
                  <span>{email}</span>
                  <span className="rounded-md border border-brand/10 px-2 py-0.5 text-xs text-brand/60">
                    시스템
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* DB 관리자 목록 */}
        <section className="space-y-3 rounded-2xl border border-brand/10 p-4">
          <div>
            <h3 className="text-sm font-semibold text-black">DB 관리자</h3>
            <p className="mt-1 text-xs leading-5 text-black/50">
              관리자 화면에서 직접 추가·삭제할 수 있는 계정입니다.
            </p>
          </div>
          {data.dbAdmins.length === 0 ? (
            <p className="text-sm text-black/40">등록된 DB 관리자가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {data.dbAdmins.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between rounded-xl border border-brand/8 bg-white px-4 py-2.5 text-sm text-black"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(email)}
                    className="text-xs text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 추가 폼 */}
        <form className="space-y-3" onSubmit={handleAdd}>
          <h3 className="text-sm font-semibold text-black">관리자 추가</h3>
          <div className="flex gap-2">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="flex-1"
            />
            <Button type="submit" disabled={isPending || !newEmail.trim()}>
              {isPending ? "처리 중..." : "추가"}
            </Button>
          </div>
          {feedback ? (
            <p className={`text-sm ${feedback.includes("실패") || feedback.includes("없") ? "text-red-500" : "text-brand"}`}>
              {feedback}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
