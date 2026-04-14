import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient as createServerAuthClient } from "@/lib/server";

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

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

export async function isAuthorizedAdminRequest(request: NextRequest) {
  const supabase = await createServerAuthClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return Boolean(user && isAllowedAdminEmail(user.email));
}
