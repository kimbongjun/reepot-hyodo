import { NextResponse } from "next/server";
import { incrementCommentLike } from "@/lib/comments";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_: Request, { params }: Props) {
  const { id } = await params;

  try {
    const likeCount = await incrementCommentLike(id);
    return NextResponse.json({ likeCount });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "좋아요 처리에 실패했습니다."
      },
      { status: 400 }
    );
  }
}
