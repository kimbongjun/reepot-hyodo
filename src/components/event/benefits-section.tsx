const benefits = [
  {
    title: "참여 즉시 노출",
    description:
      "등록 직후 공개 피드에 반영되어 현장 참여감을 빠르게 끌어올립니다."
  },
  {
    title: "운영 데이터 분리",
    description:
      "이름과 연락처는 관리자 화면에서만 관리하고 공개 화면에는 닉네임과 메시지만 보여줍니다."
  },
  {
    title: "캠페인 확장성",
    description:
      "로고, 메시지, 색상 시스템만 바꾸면 다른 이벤트로 유연하게 전환할 수 있습니다."
  }
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="space-y-6">
      <div className="space-y-3">
        <h2 className="font-[var(--font-display)] text-3xl font-black tracking-[-0.03em] text-black md:text-4xl">
          이벤트 참여 혜택
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.title}
            className="rounded-[1.75rem] border border-brand/10 bg-white/85 p-6 shadow-panel backdrop-blur"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-brand/55">0{index + 1}</p>
              <span className="h-2.5 w-2.5 rounded-full bg-sky" />
            </div>
            <h3 className="mt-6 text-xl font-black tracking-[-0.02em] text-black">
              {benefit.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-black/65">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
