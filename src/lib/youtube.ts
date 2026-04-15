const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function isValidVideoId(id: string | null | undefined): id is string {
  return Boolean(id && YOUTUBE_VIDEO_ID_PATTERN.test(id));
}

function normalizeYoutubeUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "") || null;
      return isValidVideoId(id) ? id : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1] || null;
        return isValidVideoId(id) ? id : null;
      }

      const id = parsed.searchParams.get("v");
      return isValidVideoId(id) ? id : null;
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
