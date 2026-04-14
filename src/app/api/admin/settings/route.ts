import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSiteSettings, updateYoutubeUrl } from "@/lib/site-settings";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    youtubeUrl?: string | null;
  };

  try {
    const settings = await updateYoutubeUrl(body.youtubeUrl ?? null);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "설정 저장에 실패했습니다."
      },
      { status: 400 }
    );
  }
}
