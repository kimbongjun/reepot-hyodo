"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminUser = {
  email: string;
  role: string;
};

type AdminData = {
  dbAdmins: AdminUser[];
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
  if (typeof value !== "object" || value === null || !("message" in value)) return null;
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

const ROLE_LABEL: Record<string, string> = {
  superadmin: "슈퍼관리자",
  admin: "관리자"
};

function RoleBadge({ role }: { role: string }) {
  const isSuperadmin = role === "superadmin";
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
        isSuperadmin
          ? "border-brand/30 bg-brand/8 text-brand"
          : "border-black/10 bg-black/5 text-black/50"
      }`}
    >
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

export function AdminManagementCard() {
  const [data, setData] = useState<AdminData>({ dbAdmins: [], envAdmins: [] });
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Add form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "superadmin">("admin");

  // Per-admin password change state
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [pwValue, setPwValue] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAdmins() {
      try {
        const res = await fetch("/api/admin/admins");
        const result = await readJson(res);

        if (!res.ok || !isAdminData(result)) {
          throw new Error(getResponseMessage(result) ?? "관리자 목록을 불러오지 못했습니다.");
        }

        if (isMounted) setData(result);
      } catch (error) {
        if (isMounted) {
          setFeedback({
            text: error instanceof Error ? error.message : "관리자 목록을 불러오지 못했습니다.",
            isError: true
          });
        }
      }
    }

    loadAdmins();
    return () => { isMounted = false; };
  }, []);

  function showFeedback(text: string, isError = false) {
    setFeedback({ text, isError });
  }

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole })
        });

        const result = await readJson(res);
        const added = result as { email?: string; role?: string } | null;

        if (!res.ok || !added?.email) {
          throw new Error(getResponseMessage(result) ?? "추가에 실패했습니다.");
        }

        setNewEmail("");
        setNewPassword("");
        setNewRole("admin");
        setData((prev) => ({
          ...prev,
          dbAdmins: prev.dbAdmins.some((a) => a.email === added.email)
            ? prev.dbAdmins.map((a) =>
                a.email === added.email ? { email: added.email!, role: added.role ?? "admin" } : a
              )
            : [...prev.dbAdmins, { email: added.email!, role: added.role ?? "admin" }]
        }));
        showFeedback(`${added.email} 관리자가 추가되었습니다.`);
      } catch (error) {
        showFeedback(error instanceof Error ? error.message : "추가에 실패했습니다.", true);
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

        if (!res.ok) throw new Error(getResponseMessage(result) ?? "삭제에 실패했습니다.");

        setData((prev) => ({ ...prev, dbAdmins: prev.dbAdmins.filter((a) => a.email !== email) }));
        showFeedback(`${email} 관리자가 삭제되었습니다.`);
      } catch (error) {
        showFeedback(error instanceof Error ? error.message : "삭제에 실패했습니다.", true);
      }
    });
  }

  function handleRoleChange(email: string, role: string) {
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/admins/${encodeURIComponent(email)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role })
        });

        const result = await readJson(res);
        if (!res.ok) throw new Error(getResponseMessage(result) ?? "권한 변경에 실패했습니다.");

        setData((prev) => ({
          ...prev,
          dbAdmins: prev.dbAdmins.map((a) => (a.email === email ? { ...a, role } : a))
        }));
        showFeedback(`${email} 권한이 변경되었습니다.`);
      } catch (error) {
        showFeedback(error instanceof Error ? error.message : "권한 변경에 실패했습니다.", true);
      }
    });
  }

  function handlePasswordChange(email: string) {
    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/admins/${encodeURIComponent(email)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pwValue })
        });

        const result = await readJson(res);
        if (!res.ok) throw new Error(getResponseMessage(result) ?? "비밀번호 변경에 실패했습니다.");

        setExpandedEmail(null);
        setPwValue("");
        showFeedback(`${email} 비밀번호가 변경되었습니다.`);
      } catch (error) {
        showFeedback(error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다.", true);
      }
    });
  }

  function togglePasswordForm(email: string) {
    if (expandedEmail === email) {
      setExpandedEmail(null);
      setPwValue("");
    } else {
      setExpandedEmail(email);
      setPwValue("");
    }
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <CardTitle>관리자 계정 관리</CardTitle>
        <CardDescription>
          관리자를 추가·삭제하거나 비밀번호와 권한을 변경합니다. 환경변수로 등록된 계정은 읽기 전용입니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ENV 관리자 */}
        {data.envAdmins.length > 0 && (
          <section className="space-y-3 rounded-2xl border border-brand/10 p-4">
            <div>
              <h3 className="text-sm font-semibold text-black">시스템 관리자 (ENV)</h3>
              <p className="mt-1 text-xs leading-5 text-black/50">
                환경변수 <code className="rounded bg-[#f7fbff] px-1 py-0.5">ADMIN_EMAILS</code>로
                등록된 계정입니다. 수정하려면 환경변수를 직접 변경하세요.
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
              어드민 화면에서 직접 추가·삭제할 수 있는 계정입니다.
            </p>
          </div>
          {data.dbAdmins.length === 0 ? (
            <p className="text-sm text-black/40">등록된 DB 관리자가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {data.dbAdmins.map((admin) => (
                <li key={admin.email} className="rounded-xl border border-brand/8 bg-white">
                  {/* 기본 행 */}
                  <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-black">
                      {admin.email}
                    </span>
                    {/* 역할 선택 */}
                    <select
                      value={admin.role}
                      disabled={isPending}
                      onChange={(e) => handleRoleChange(admin.email, e.target.value)}
                      className="rounded-md border border-black/10 bg-transparent px-2 py-0.5 text-xs text-black/60 focus:outline-none disabled:opacity-40"
                    >
                      <option value="admin">관리자</option>
                      <option value="superadmin">슈퍼관리자</option>
                    </select>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => togglePasswordForm(admin.email)}
                      className="text-xs text-brand/70 transition-colors hover:text-brand disabled:opacity-40"
                    >
                      비밀번호 변경
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(admin.email)}
                      className="text-xs text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
                    >
                      삭제
                    </button>
                  </div>

                  {/* 비밀번호 변경 인라인 폼 */}
                  {expandedEmail === admin.email && (
                    <div className="border-t border-brand/8 px-4 py-3">
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={pwValue}
                          onChange={(e) => setPwValue(e.target.value)}
                          placeholder="새 비밀번호 (8자 이상)"
                          className="flex-1 text-sm"
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={isPending || pwValue.length < 8}
                          onClick={() => handlePasswordChange(admin.email)}
                        >
                          {isPending ? "저장 중..." : "저장"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => { setExpandedEmail(null); setPwValue(""); }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 관리자 추가 폼 */}
        <form className="space-y-3" onSubmit={handleAdd}>
          <h3 className="text-sm font-semibold text-black">관리자 추가</h3>
          <div className="space-y-2">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="이메일 주소"
              required
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="비밀번호 (8자 이상)"
              required
              minLength={8}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "admin" | "superadmin")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="admin">관리자</option>
              <option value="superadmin">슈퍼관리자</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={isPending || !newEmail.trim() || newPassword.length < 8}
            className="w-full"
          >
            {isPending ? "처리 중..." : "관리자 추가"}
          </Button>
        </form>

        {/* 피드백 메시지 */}
        {feedback && (
          <p className={`text-sm ${feedback.isError ? "text-red-500" : "text-brand"}`}>
            {feedback.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
