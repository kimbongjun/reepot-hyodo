import { NextResponse } from "next/server";
import { getAdminUser, getDbAdminEmails } from "@/lib/admin-auth";
import { parseAdminEmails } from "@/lib/admin-emails";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [dbEmails, envEmails] = await Promise.all([
    getDbAdminEmails(),
    Promise.resolve(parseAdminEmails())
  ]);

  return NextResponse.json({ dbAdmins: dbEmails, envAdmins: envEmails });
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "유효한 이메일을 입력해 주세요." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  const { error } = await supabase
    .from("admin_users")
    .upsert({ email }, { onConflict: "email" });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ email });
}
