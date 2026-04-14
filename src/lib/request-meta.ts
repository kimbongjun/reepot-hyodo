import type { CommentRequestMeta } from "@/lib/types";

function pickFirst(values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim().length)?.trim() ?? null;
}

export function getCommentRequestMeta(request: Request): CommentRequestMeta {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipFromList = forwardedFor?.split(",")[0]?.trim() ?? null;

  return {
    ip_address: pickFirst([
      request.headers.get("x-real-ip"),
      request.headers.get("cf-connecting-ip"),
      request.headers.get("x-client-ip"),
      ipFromList
    ]),
    country: pickFirst([
      request.headers.get("x-vercel-ip-country"),
      request.headers.get("cf-ipcountry")
    ]),
    region: pickFirst([request.headers.get("x-vercel-ip-country-region")]),
    city: pickFirst([request.headers.get("x-vercel-ip-city")]),
    timezone: pickFirst([request.headers.get("x-vercel-ip-timezone")]),
    user_agent: pickFirst([request.headers.get("user-agent")])
  };
}
