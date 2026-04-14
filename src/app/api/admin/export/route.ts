import { NextResponse } from "next/server";
import { convertCommentsToCsv } from "@/lib/csv";
import { getAdminComments } from "@/lib/comments";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const user = await getAdminUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const comments = await getAdminComments();
  const csv = convertCommentsToCsv(comments);

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="comment-export.csv"'
    }
  });
}
