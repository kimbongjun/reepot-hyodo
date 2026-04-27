type BenefitItem = {
  title: string;
  description: string;
};

type Props = {
  title: string;
  items: BenefitItem[];
};

export function BenefitsSection({ title, items }: Props) {
  return (
    <section id="benefits" className="space-y-6">
      {/* <div className="space-y-3">
        <h2 className="font-[var(--font-display)] text-3xl font-black tracking-[-0.03em] text-black md:text-4xl">
          {title}
        </h2>
      </div> */}

      <div className="grid gap-4">
        {items.map((benefit, index) => (
          <article
            key={`${benefit.title}-${index}`}
            className="rounded-[1.75rem] border border-brand/10 bg-white/85 p-6 shadow-panel backdrop-blur"
          >
            {/* <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-brand/55">{`0${index + 1}`}</p>
              <span className="h-2.5 w-2.5 rounded-full bg-sky" />
            </div> */}
            <h2 className="font-[var(--font-display)] text-2xl font-black tracking-[-0.03em] text-black">
              {title}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/65">
              {benefit.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
