"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminData = {
  dbAdmins: string[];
  envAdmins: string[];
};

function isAdminData(value: unknown): value is AdminData {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as AdminData).dbAdmins) &&
    Array.isArray((value as AdminData).envAdmins)
  );
}

function getResponseMessage(value: unknown) {
  if (typeof value !== "object" || value === null || !("message" in value)) {
    return null;
  }

  const message = (value as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export function AdminManagementCard() {
  const [data, setData] = useState<AdminData>({ dbAdmins: [], envAdmins: [] });
  const [newEmail, setNewEmail] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function loadAdmins() {
      try {
        const response = await fetch("/api/admin/admins");
        const result = await readJson(response);

        if (!response.ok || !isAdminData(result)) {
          throw new Error(
            getResponseMessage(result) ?? "관리자 목록을 불러오지 못했습니다."
          );
        }

        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        if (isMounted) {
          setFeedback(
            error instanceof Error ? error.message : "관리자 목록을 불러오지 못했습니다."
          );
        }
      }
    }

    loadAdmins();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newEmail })
        });

        const result = await readJson(res);
        const email =
          typeof result === "object" &&
          result !== null &&
          typeof (result as { email?: unknown }).email === "string"
            ? (result as { email: string }).email
            : null;

        if (!res.ok || !email) {
          throw new Error(getResponseMessage(result) ?? "추가에 실패했습니다.");
        }

        setNewEmail("");
        setData((prev) => ({
          ...prev,
          dbAdmins: prev.dbAdmins.includes(email)
            ? prev.dbAdmins
            : [...prev.dbAdmins, email]
        }));
        setFeedback(`${email} 관리자가 추가되었습니다.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "추가에 실패했습니다.");
      }
    });
  }

  function handleDelete(email: string) {
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/admins/${encodeURIComponent(email)}`, {
          method: "DELETE"
        });

        const result = await readJson(res);

        if (!res.ok) {
          throw new Error(getResponseMessage(result) ?? "삭제에 실패했습니다.");
        }

        setData((prev) => ({
          ...prev,
          dbAdmins: prev.dbAdmins.filter((e) => e !== email)
        }));
        setFeedback(`${email} 관리자가 삭제되었습니다.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "삭제에 실패했습니다.");
      }
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
