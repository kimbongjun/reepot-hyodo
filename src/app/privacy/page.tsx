import { getSiteSettings } from "@/lib/site-settings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const html = settings.privacyPolicy;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-black/50 transition-colors hover:text-black/80"
        >
          ← 이벤트 페이지로 돌아가기
        </Link>
      </div>
      <h1 className="mb-8 text-3xl font-black tracking-[-0.03em] text-black">
        개인정보처리방침
      </h1>
      {html ? (
        <div
          className="privacy-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-black/50">개인정보처리방침이 아직 등록되지 않았습니다.</p>
      )}
    </main>
  );
}
