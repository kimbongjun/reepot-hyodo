import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  hasPublicSupabaseEnv,
  supabaseAnonKey,
  supabaseUrl
} from "@/lib/supabase/env";

function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export async function updateSession(request: NextRequest) {
  if (!hasPublicSupabaseEnv || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAuthArea = pathname.startsWith("/auth/login");

  if (!isAdminArea) {
    return response;
  }

  if (!user) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const admins = parseAdminEmails();
  const email = user.email?.toLowerCase();

  if (!email || !admins.includes(email)) {
    if (isAuthArea) {
      return response;
    }

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  return response;
}
