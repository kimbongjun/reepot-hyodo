"use client";

import { useDeferredValue } from "react";
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

export function CommentsTable({ comments }: Props) {
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
    comments
      .map((item) => item.phone)
      .filter((phone, _, array) => array.filter((candidate) => candidate === phone).length > 1)
  );

  const regions = [
    ...new Set(comments.map(getRegionLabel).filter((item): item is string => Boolean(item)))
  ].sort();
  const timezones = [
    ...new Set(
      comments
        .map((item) => item.timezone)
        .filter((item): item is string => Boolean(item))
    )
  ].sort();

  const filteredComments = comments.filter((item) => {
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

  return (
    <Card className="border-brand/10">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>참여 데이터 원본</CardTitle>
              <CardDescription className="mt-1">
                검색어, 날짜, 지역, 시간대, 중복 연락처 필터를 조합해 운영 이슈를 바로
                확인할 수 있습니다.
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
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-lg border border-brand/10">
          <Table>
            <TableHeader className="bg-[#f8fcff]">
              <TableRow>
                <TableHead>등록일시</TableHead>
                <TableHead>닉네임</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>메시지</TableHead>
                <TableHead>IP / 지역</TableHead>
                <TableHead>시간대</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.length ? (
                filteredComments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-black/55">
                      {new Intl.DateTimeFormat("ko-KR", {
                        dateStyle: "short",
                        timeStyle: "short"
                      }).format(new Date(item.created_at))}
                    </TableCell>
                    <TableCell className="font-medium">{item.nickname}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <div>{item.phone}</div>
                      {duplicatePhoneSet.has(item.phone) ? (
                        <div className="text-xs font-medium text-brand">중복 연락처</div>
                      ) : null}
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-black/45">
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
