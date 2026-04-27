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
    <section className="space-y-5">
      {(sectionTitle || sectionDescription) && (
        <div className="space-y-2">
          {sectionTitle && (
            <h2 className="font-[var(--font-display)] text-3xl font-black tracking-[-0.03em] text-black md:text-4xl">
              {sectionTitle}
            </h2>
          )}
          {sectionDescription && (
            <p className="text-sm leading-6 text-black/55">{sectionDescription}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((card, index) => (
          <article
            key={index}
            className="overflow-hidden rounded-[1.75rem] border border-brand/10 bg-white/85 shadow-panel backdrop-blur"
          >
            {card.imageUrl && (
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {card.winnerLabel && (
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold tracking-[-0.01em] text-brand shadow-sm backdrop-blur-sm">
                    {card.winnerLabel}
                  </span>
                )}
              </div>
            )}

            <div className="p-6 space-y-3">
              {!card.imageUrl && card.winnerLabel && (
                <span className="inline-block rounded-full bg-sky/30 px-3.5 py-1.5 text-xs font-bold tracking-[-0.01em] text-brand">
                  {card.winnerLabel}
                </span>
              )}
              {card.title && (
                <h3 className="text-xl font-black tracking-[-0.02em] text-black">
                  {card.title}
                </h3>
              )}
              {card.description && (
                <p className="whitespace-pre-wrap text-sm leading-6 text-black/65">
                  {card.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
