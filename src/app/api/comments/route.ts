import { NextResponse } from "next/server";
import { createCommentSubmission, getPublicComments } from "@/lib/comments";
import { getCommentRequestMeta } from "@/lib/request-meta";
import type { CommentFormInput } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const comments = await getPublicComments();
  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "올바른 JSON 형식이 아닙니다." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "요청 본문이 유효하지 않습니다." }, { status: 400 });
  }

  const input = body as CommentFormInput;
  const meta = getCommentRequestMeta(request);
  const result = await createCommentSubmission(input, meta);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
