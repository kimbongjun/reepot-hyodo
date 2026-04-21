import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "리팟 효도 캠페인",
  description: "실시간 참여형 이벤트 랜딩 페이지와 관리자 운영 화면"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@latest/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
