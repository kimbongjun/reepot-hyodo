import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { updateSiteSettings } from "@/lib/site-settings";
import type { SiteSettings } from "@/lib/types";

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    settings?: Partial<SiteSettings>;
  };

  try {
    const settings = await updateSiteSettings(body.settings ?? {});
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
