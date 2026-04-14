# Reepot Hyodo Event Page

Next.js App Router 기반의 이벤트 랜딩 페이지와 관리자 CMS 예제입니다.

## 포함 기능

- 공개 이벤트 페이지
- 유튜브 영상 영역
- 실시간 참여 등록 및 피드 노출
- 이벤트 특장점 안내 섹션
- 관리자 페이지(`/admin`)
- 참여 입력 정보 조회
- CSV export
- 기본 통계 카드와 시간대별 참여 차트

## 사용 스택

- Next.js
- React
- Tailwind CSS
- Zustand
- Supabase

## 실행 순서

1. `npm install`
2. `.env.local` 생성 후 Supabase 환경변수 설정
3. Supabase SQL Editor에서 `supabase/schema.sql` 실행
4. `npm run dev`

공개 페이지에는 `닉네임`, `메시지`, `등록 시각`만 노출됩니다.
