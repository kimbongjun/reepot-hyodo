import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { parseAdminEmails } from "@/lib/admin-emails";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail).toLowerCase();

  if (parseAdminEmails().includes(email)) {
    return NextResponse.json(
      { message: "환경변수로 등록된 관리자는 삭제할 수 없습니다." },
      { status: 403 }
    );
  }

  if (user.email?.toLowerCase() === email) {
    return NextResponse.json(
      { message: "현재 로그인된 계정은 삭제할 수 없습니다." },
      { status: 403 }
    );
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("email", email);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ email });
}
