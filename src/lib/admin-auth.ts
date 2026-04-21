import { redirect } from "next/navigation";
import { createClient as createServerAuthClient } from "@/lib/server";
import { parseAdminEmails } from "@/lib/admin-emails";

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const admins = parseAdminEmails();
  return admins.includes(email.toLowerCase());
}

export async function requireAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (!isAllowedAdminEmail(user.email)) {
    redirect("/auth/login?error=unauthorized");
  }

  return user;
}

export async function getAdminUser() {
  const supabase = await createServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    return null;
  }

  return user;
}

