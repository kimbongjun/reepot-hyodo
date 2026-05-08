import { NextResponse } from "next/server";
import { incrementCommentLike } from "@/lib/comments";
import { getCommentRequestMeta } from "@/lib/request-meta";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  const { id } = await params;
  const { ip_address } = getCommentRequestMeta(request);

  try {
    const result = await incrementCommentLike(id, ip_address);

    if (result.alreadyLiked) {
      return NextResponse.json(
        { message: "이미 좋아요를 눌렀습니다.", likeCount: result.likeCount },
        { status: 409 }
      );
    }

    return NextResponse.json({ likeCount: result.likeCount });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "좋아요 처리에 실패했습니다."
      },
      { status: 400 }
    );
  }
}
