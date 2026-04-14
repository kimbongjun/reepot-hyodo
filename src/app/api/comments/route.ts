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
  const body = (await request.json()) as CommentFormInput;
  const meta = getCommentRequestMeta(request);
  const result = await createCommentSubmission(body, meta);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
