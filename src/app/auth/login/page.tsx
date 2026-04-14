import Image from "next/image";
import reepotLogo from "@/imgs/reepot_BI_H.svg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

type PageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

  return (
    <main className="grain flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-brand/12 bg-white/92 shadow-panel backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit rounded-2xl border border-brand/10 bg-[#f8fcff] px-4 py-3">
            <Image src={reepotLogo} alt="Reepot" className="h-8 w-auto" priority />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-[-0.03em]">
              관리자 로그인
            </CardTitle>
            <CardDescription className="leading-6">
              등록된 관리자 계정만 이벤트 데이터와 분석 화면에 접근할 수 있습니다.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginForm
            nextPath={params.next}
            unauthorized={params.error === "unauthorized"}
          />
        </CardContent>
      </Card>
    </main>
  );
}
