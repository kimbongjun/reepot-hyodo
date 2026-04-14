import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reepot Event Landing",
  description: "실시간 참여형 이벤트 랜딩 페이지와 관리자 운영 화면"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
