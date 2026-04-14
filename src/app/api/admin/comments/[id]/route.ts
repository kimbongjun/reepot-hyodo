import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { deleteCommentSubmission, updateCommentHidden } from "@/lib/comments";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, { params }: Props) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteCommentSubmission(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "댓글 삭제에 실패했습니다."
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: Props) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    hidden?: boolean;
  };

  if (typeof body.hidden !== "boolean") {
    return NextResponse.json({ message: "hidden 값이 필요합니다." }, { status: 400 });
  }

  try {
    await updateCommentHidden(id, body.hidden);
    return NextResponse.json({ ok: true, hidden: body.hidden });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "댓글 가리기 설정에 실패했습니다."
      },
      { status: 400 }
    );
  }
}
