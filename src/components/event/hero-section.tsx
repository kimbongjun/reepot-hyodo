import Image from "next/image";
import reepotLogo from "@/imgs/reepot_BI_H.svg";
import classysLogo from "@/imgs/classys_logo.svg";
import reepotBannerDesktop from "@/imgs/Reepot_respotlight_Web_banner_V1_20260428.png";
import reepotBannerMobile from "@/imgs/Reepot_respotlight_banner.jpg";


type Props = {
  title: string;
  description: string;
};

export function HeroSection({ title, description }: Props) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-brand/10 bg-white/80 shadow-panel backdrop-blur">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(218,200,181,0.35),transparent_38%)]" />
      <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-sky/25 blur-3xl" />
      <div className="absolute bottom-0 right-10 h-52 w-52 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative grid gap-8 md:items-end">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-[1.25rem] bg-white shadow-[0_20px_40px_rgba(44, 44, 44, 0.08)]">
                <Image
                  src={reepotBannerDesktop}
                  alt="Reepot 효도캠페인"
                  className="w-full hidden md:block"
                  priority
                />
                <Image
                  src={reepotBannerMobile}
                  alt="Reepot 효도캠페인"
                  className="w-full block md:hidden"
                  priority
                />
              </div>
              {/* <div className="rounded-[1.25rem] border border-brand/12 bg-[#f4fbff] px-4 py-3">
                <Image src={classysLogo} alt="Classys 로고" className="h-7 w-auto md:h-8" />
              </div> */}
            </div>

            {/* <h1 className="max-w-3xl font-[var(--font-display)] text-4xl font-black leading-[1.15] tracking-[-0.04em] text-black md:text-6xl break-keep">
              {title}
            </h1>    
            <div
              className="text-2xl md:text-2xl"
              dangerouslySetInnerHTML={{ __html: description }}
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
}
