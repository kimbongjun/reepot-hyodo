import type { VideoType } from "@/lib/types";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Props = {
  title: string;
  emptyMessage: string;
  videoType: VideoType;
  youtubeUrl: string | null;
  mp4Url: string | null;
};

export function YoutubeSection({ title, emptyMessage, videoType, youtubeUrl, mp4Url }: Props) {
  const embedUrl = videoType === "youtube" ? getYoutubeEmbedUrl(youtubeUrl) : null;
  const videoUrl = videoType === "mp4" ? mp4Url : null;
  const hasVideo = videoType === "youtube" ? Boolean(embedUrl) : Boolean(videoUrl);

  return (
    <section className="rounded-[1.9rem] border border-brand/10 bg-white/88 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-black">{title}</h2>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-brand/10 bg-[#f7fbff]">
        {hasVideo ? (
          <div className="aspect-video">
            {videoType === "youtube" && embedUrl ? (
              <iframe
                src={embedUrl}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl ?? undefined}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm leading-6 text-black/50">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}
