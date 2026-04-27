import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { parseAdminEmails } from "@/lib/admin-emails";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
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
      { message: "환경변수로 등록된 관리자는 수정할 수 없습니다." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { password?: string; role?: string };
  const { password, role } = body;

  if (!password && !role) {
    return NextResponse.json({ message: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  if (password !== undefined) {
    if (password.length < 8) {
      return NextResponse.json({ message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
    }

    const { data: listData } = await supabase.auth.admin.listUsers();
    const authUser = listData?.users.find((u) => u.email?.toLowerCase() === email);

    if (!authUser) {
      return NextResponse.json({ message: "인증 계정을 찾을 수 없습니다." }, { status: 404 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
      password
    });
    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }
  }

  if (role !== undefined) {
    const validRole = role === "superadmin" ? "superadmin" : "admin";
    const { error: roleError } = await supabase
      .from("admin_users")
      .update({ role: validRole })
      .eq("email", email);
    if (roleError) {
      return NextResponse.json({ message: roleError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ email, updated: true });
}

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

  const { error: dbError } = await supabase
    .from("admin_users")
    .delete()
    .eq("email", email);

  if (dbError) {
    return NextResponse.json({ message: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ email });
}
