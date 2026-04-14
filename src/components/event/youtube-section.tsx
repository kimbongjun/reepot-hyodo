import { getYoutubeEmbedUrl } from "@/lib/youtube";

type Props = {
  youtubeUrl: string | null;
};

export function YoutubeSection({ youtubeUrl }: Props) {
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  return (
    <section className="rounded-[1.9rem] border border-brand/10 bg-white/88 p-6 shadow-panel backdrop-blur md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>          
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-black">
            유튜브 영상
          </h2>
        </div>       
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-brand/10 bg-[#f7fbff]">
        {embedUrl ? (
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title="이벤트 유튜브 영상"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm leading-6 text-black/50">
            아직 등록된 유튜브 영상이 없습니다. 관리자 화면에서 URL을 입력하면 여기에
            바로 반영됩니다.
          </div>
        )}
      </div>
    </section>
  );
}
