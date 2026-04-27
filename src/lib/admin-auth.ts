import { redirect } from "next/navigation";
import { createClient as createServerAuthClient } from "@/lib/server";
import { parseAdminEmails } from "@/lib/admin-emails";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export function isEnvAdminEmail(email: string | null | undefined): email is string {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
}

export async function getDbAdminEmails(): Promise<string[]> {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("admin_users")
    .select("email");

  return (data ?? []).map((row) => row.email.toLowerCase());
}

export async function isAllowedAdminEmailAsync(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (parseAdminEmails().includes(lower)) return true;

  const dbEmails = await getDbAdminEmails();
  return dbEmails.includes(lower);
}

export async function requireAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const allowed = await isAllowedAdminEmailAsync(user.email);
  if (!allowed) {
    redirect("/auth/login?error=unauthorized");
  }

  return user;
}

export async function getAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const allowed = await isAllowedAdminEmailAsync(user.email);
  if (!allowed) return null;

  return user;
}
