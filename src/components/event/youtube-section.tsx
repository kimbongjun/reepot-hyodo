import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Props = {
  title: string;
  emptyMessage: string;
  youtubeUrl: string | null;
};

export function YoutubeSection({ title, emptyMessage, youtubeUrl }: Props) {
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  return (
    <section className="rounded-[1.9rem] border border-brand/10 bg-white/88 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-black">{title}</h2>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-brand/10 bg-[#f7fbff]">
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
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
