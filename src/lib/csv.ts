import type { CommentSubmission } from "@/lib/types";

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

function escapeCell(value: string) {
  const sanitized = FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))
    ? `'${value}`
    : value;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export function convertCommentsToCsv(items: CommentSubmission[]) {
  const header = [
    "등록일시",
    "닉네임",
    "이름",
    "연락처",
    "메시지",
    "IP",
    "국가",
    "지역",
    "도시",
    "시간대",
    "User-Agent"
  ];

  const rows = items.map((item) => [
    item.created_at,
    item.nickname,
    item.name,
    item.phone,
    item.message,
    item.ip_address ?? "",
    item.country ?? "",
    item.region ?? "",
    item.city ?? "",
    item.timezone ?? "",
    item.user_agent ?? ""
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
    .join("\n");
}
