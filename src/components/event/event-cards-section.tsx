type EventCard = {
  winnerLabel: string;
  imageUrl: string | null;
  title: string;
  description: string;
};

type Props = {
  sectionTitle: string;
  sectionDescription: string;
  cards: EventCard[];
};

export function EventCardsSection({ sectionTitle, sectionDescription, cards }: Props) {
  const visible = cards.filter((c) => c.imageUrl || c.title || c.description);
  if (!visible.length) return null;

  return (
    <section className="space-y-6">

      {/* 섹션 헤더 */}
      {(sectionTitle || sectionDescription) && (
        <div className="space-y-3">          
          {sectionTitle && (
            <h2 className="text-center font-[var(--font-display)] text-3xl gap-3 font-black tracking-[-0.03em] text-black md:text-4xl">
              {sectionTitle}
            </h2>
          )}
          {sectionDescription && (
            <div
              className="text-center text-xl text-black/50 break-keep"
              dangerouslySetInnerHTML={{ __html: sectionDescription }}
            />
          )}
        </div>
      )}

      {/* 경품 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((card, index) => (
          <article
            key={index}
            className="group relative min-h-[300px] overflow-hidden rounded-[1.75rem] shadow-panel md:min-h-[340px]"
          >
            {/* 배경 이미지 or 브랜드 그라디언트 폴백 */}
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-[#1a6fa0]" />
            )}

            {/* 하단 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />

            {/* 우측 장식 번호 */}
            <div
              aria-hidden="true"
              className="absolute right-4 top-4 select-none font-[var(--font-display)] text-[6rem] font-black leading-none text-white/10 transition-opacity duration-500 group-hover:text-white/15"
            >
              {`0${index + 1}`}
            </div>

            {/* 당첨 표기 배지 */}
            {card.winnerLabel && (
              <div className="absolute left-5 top-5">
                <span className="bg-white inline-flex items-center gap-1.5 rounded-full bg-white/92 px-4 py-1.5 text-md font-black tracking-[-0.01em] text-[#474c52] shadow backdrop-blur-sm">
                  {/* <span className="h-1.5 w-1.5 rounded-full bg-brand/60" /> */}
                  {card.winnerLabel}
                </span>
              </div>
            )}

            {/* 하단 텍스트 */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {card.title && (
                <h3 className="text-3xl font-black tracking-[-0.02em] text-white drop-shadow-sm">
                  {card.title}
                </h3>
              )}
              {card.description && (
                <div
                  className="mt-2 text-lg leading-6 text-white/70"
                  dangerouslySetInnerHTML={{ __html: card.description }}
                />
              )}
              {/* 카드 하단 구분선 강조 */}
              <div className="mt-4 h-px w-12 rounded-full bg-white/30" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
