function normalizeYoutubeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1] || null;
      }

      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(url: string | null | undefined) {
  const videoId = url ? normalizeYoutubeUrl(url) : null;
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}`;
}
