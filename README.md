# Reepot Hyodo Event Page

Next.js App Router 기반의 이벤트 랜딩 페이지와 관리자 대시보드 프로젝트다.

## 주요 기능

- 공개 이벤트 페이지
- 댓글 등록 및 공개 댓글 노출
- 댓글 좋아요
- 유튜브 섹션 관리
- 관리자 페이지 `/admin`
- 참여 데이터 조회 및 CSV 다운로드

## 사용 스택

- Next.js
- React
- Tailwind CSS
- Zustand
- Supabase

## 실행 순서

1. `npm install`
2. `.env.local`에 Supabase 환경변수와 `ADMIN_EMAILS` 설정
3. Supabase SQL Editor에서 `supabase/schema.sql` 실행
4. `npm run dev`

## 운영 문서

`harness` 기준의 실행, 검증, 배포 문서는 [docs/harness/README.md](./docs/harness/README.md)에서 시작한다.
