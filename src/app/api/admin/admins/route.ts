import { NextResponse } from "next/server";
import { getAdminUser, getDbAdminEmails } from "@/lib/admin-auth";
import { parseAdminEmails } from "@/lib/admin-emails";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabaseClient();
  const envEmails = parseAdminEmails();

  if (!supabase) {
    const dbEmails = await getDbAdminEmails();
    return NextResponse.json({
      dbAdmins: dbEmails.map((email) => ({ email, role: "admin" })),
      envAdmins: envEmails
    });
  }

  const { data } = await supabase
    .from("admin_users")
    .select("email, role")
    .order("created_at", { ascending: true });

  const dbAdmins = (data ?? []).map((row) => ({
    email: row.email as string,
    role: (row.role as string) ?? "admin"
  }));

  return NextResponse.json({ dbAdmins, envAdmins: envEmails });
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
    role?: string;
  };
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const role = body.role === "superadmin" ? "superadmin" : "admin";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ message: "유효한 이메일을 입력해 주세요." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  // Create or update Supabase Auth user
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError) {
    if (
      createError.message.toLowerCase().includes("already registered") ||
      createError.message.toLowerCase().includes("already exists") ||
      createError.message.toLowerCase().includes("duplicate")
    ) {
      // User already in Auth — update their password
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users.find((u) => u.email?.toLowerCase() === email);
      if (existing) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
          password
        });
        if (updateError) {
          return NextResponse.json({ message: updateError.message }, { status: 400 });
        }
      }
    } else {
      return NextResponse.json({ message: createError.message }, { status: 400 });
    }
  }

  const { error: dbError } = await supabase
    .from("admin_users")
    .upsert({ email, role }, { onConflict: "email" });

  if (dbError) {
    return NextResponse.json({ message: dbError.message }, { status: 400 });
  }

  return NextResponse.json({ email, role });
}
