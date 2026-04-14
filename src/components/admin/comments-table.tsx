"use client";

import { useDeferredValue, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAdminFiltersStore } from "@/store/admin-filters";
import { convertCommentsToCsv } from "@/lib/csv";
import type { CommentSubmission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type Props = {
  comments: CommentSubmission[];
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getRegionLabel(item: CommentSubmission) {
  return [item.country, item.region, item.city].filter(Boolean).join(" / ");
}

const DISPLAY_TIME_ZONE = "Asia/Seoul";

export function CommentsTable({ comments }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(comments);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isRefreshing, startTransition] = useTransition();
  const query = useAdminFiltersStore((state) => state.query);
  const dateFrom = useAdminFiltersStore((state) => state.dateFrom);
  const dateTo = useAdminFiltersStore((state) => state.dateTo);
  const region = useAdminFiltersStore((state) => state.region);
  const timezone = useAdminFiltersStore((state) => state.timezone);
  const onlyDuplicates = useAdminFiltersStore((state) => state.onlyDuplicates);
  const setQuery = useAdminFiltersStore((state) => state.setQuery);
  const setDateFrom = useAdminFiltersStore((state) => state.setDateFrom);
  const setDateTo = useAdminFiltersStore((state) => state.setDateTo);
  const setRegion = useAdminFiltersStore((state) => state.setRegion);
  const setTimezone = useAdminFiltersStore((state) => state.setTimezone);
  const setOnlyDuplicates = useAdminFiltersStore((state) => state.setOnlyDuplicates);
  const resetFilters = useAdminFiltersStore((state) => state.resetFilters);
  const deferredQuery = useDeferredValue(query);

  const duplicatePhoneSet = new Set(
    rows
      .map((item) => item.phone)
      .filter((phone, _, array) => array.filter((candidate) => candidate === phone).length > 1)
  );

  const regions = [...new Set(rows.map(getRegionLabel).filter((item): item is string => Boolean(item)))].sort();
  const timezones = [
    ...new Set(rows.map((item) => item.timezone).filter((item): item is string => Boolean(item)))
  ].sort();

  const filteredComments = rows.filter((item) => {
    const target =
      `${item.nickname} ${item.name} ${item.phone} ${item.message} ${item.ip_address ?? ""} ${item.region ?? ""} ${item.city ?? ""} ${item.timezone ?? ""}`.toLowerCase();
    const itemDate = item.created_at.slice(0, 10);
    const matchesQuery = target.includes(deferredQuery.toLowerCase());
    const matchesFrom = !dateFrom || itemDate >= dateFrom;
    const matchesTo = !dateTo || itemDate <= dateTo;
    const matchesRegion = !region || getRegionLabel(item) === region;
    const matchesTimezone = !timezone || item.timezone === timezone;
    const matchesDuplicate = !onlyDuplicates || duplicatePhoneSet.has(item.phone);

    return (
      matchesQuery &&
      matchesFrom &&
      matchesTo &&
      matchesRegion &&
      matchesTimezone &&
      matchesDuplicate
    );
  });

  async function handleHiddenToggle(item: CommentSubmission) {
    setFeedback(null);
    setPendingActionId(item.id);

    try {
      const response = await fetch(`/api/admin/comments/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          hidden: !item.hidden
        })
      });
      const result = (await response.json()) as {
        hidden?: boolean;
        message?: string;
      };

      if (!response.ok || typeof result.hidden !== "boolean") {
        throw new Error(result.message ?? "댓글 가리기 설정에 실패했습니다.");
      }

      const nextHidden = result.hidden;

      setRows((current) =>
        current.map((row) =>
          row.id === item.id
            ? {
                ...row,
                hidden: nextHidden
              }
            : row
        )
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "댓글 가리기 설정에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleDelete(item: CommentSubmission) {
    const confirmed = window.confirm(
      `${item.nickname} 댓글을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`
    );
    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setPendingActionId(item.id);

    try {
      const response = await fetch(`/api/admin/comments/${item.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message ?? "댓글 삭제에 실패했습니다.");
      }

      setRows((current) => current.filter((row) => row.id !== item.id));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>참여 데이터 원본</CardTitle>
              <CardDescription className="mt-1">
                검색어, 날짜, 지역, 시간대, 중복 연락처 필터를 조합해 운영 데이터를 바로 확인할 수 있습니다.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => resetFilters()}>
                필터 초기화
              </Button>
              <Button
                type="button"
                onClick={() =>
                  downloadCsv(
                    `comment-export-${new Date().toISOString().slice(0, 10)}.csv`,
                    convertCommentsToCsv(filteredComments)
                  )
                }
              >
                CSV Export
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="닉네임, 이름, 연락처, IP 검색"
              className="xl:col-span-2"
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="flex h-10 w-full rounded-md border border-brand/12 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/50"
            >
              <option value="">전체 지역</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="flex h-10 w-full rounded-md border border-brand/12 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/50"
            >
              <option value="">전체 시간대</option>
              {timezones.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-black/70">
            <input
              type="checkbox"
              checked={onlyDuplicates}
              onChange={(event) => setOnlyDuplicates(event.target.checked)}
              className="h-4 w-4 rounded border-brand/20"
            />
            중복 연락처만 보기
          </label>

          {feedback ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {feedback}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg border border-brand/10">
          <Table>
            <TableHeader className="bg-[#f8fcff]">
              <TableRow>
                <TableHead>등록일시</TableHead>
                <TableHead>닉네임</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead className="text-right">좋아요</TableHead>
                <TableHead>메시지</TableHead>
                <TableHead>IP / 지역</TableHead>
                <TableHead>시간대</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.length ? (
                filteredComments.map((item) => {
                  const isPending = pendingActionId === item.id || isRefreshing;

                  return (
                    <TableRow key={item.id} className={item.hidden ? "bg-black/[0.03]" : undefined}>
                      <TableCell className="text-black/55">
                        {new Intl.DateTimeFormat("ko-KR", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: DISPLAY_TIME_ZONE
                        }).format(new Date(item.created_at))}
                      </TableCell>
                      <TableCell className="font-medium">{item.nickname}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.hidden
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {item.hidden ? "가림" : "노출"}
                        </span>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div>{item.phone}</div>
                        {duplicatePhoneSet.has(item.phone) ? (
                          <div className="text-xs font-medium text-brand">중복 연락처</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-brand">
                        {item.like_count}
                      </TableCell>
                      <TableCell className="max-w-[320px] whitespace-pre-wrap text-black/70">
                        {item.message}
                      </TableCell>
                      <TableCell className="text-black/65">
                        <div>{item.ip_address ?? "-"}</div>
                        <div className="text-xs text-black/45">
                          {getRegionLabel(item) || "지역 정보 없음"}
                        </div>
                      </TableCell>
                      <TableCell className="text-black/65">{item.timezone ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleHiddenToggle(item)}
                          >
                            {item.hidden ? "숨김 해제" : "가리기"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50"
                            disabled={isPending}
                            onClick={() => handleDelete(item)}
                          >
                            {pendingActionId === item.id ? "처리 중..." : "삭제"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-black/45">
                    조회 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
