type CtaItem = {
  label: string;
  url: string;
};

type Props = {
  items: CtaItem[];
};

export function CtaSection({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <a
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between gap-8 rounded-[1.75rem] border border-brand/10 bg-white/85 p-6 shadow-panel backdrop-blur transition-all duration-200 hover:border-brand/25 hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-brand/55">{`0${index + 1}`}</p>
            <span className="h-2.5 w-2.5 rounded-full bg-sky transition-colors group-hover:bg-brand" />
          </div>
          <div className="flex items-end justify-between gap-4">
            <span className="text-lg font-black tracking-[-0.02em] text-black">
              {item.label}
            </span>
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-brand/12 bg-[#f7fbff] text-brand transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}
