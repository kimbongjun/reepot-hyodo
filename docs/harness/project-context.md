# Project Context

## 목적

이 프로젝트는 공개 이벤트 페이지와 관리자 대시보드를 함께 제공한다.

- 공개 페이지 `/`: 댓글 등록, 댓글 목록, 좋아요, 유튜브 섹션 노출
- 관리자 페이지 `/admin`: 댓글 집계, CSV 다운로드, 유튜브 URL 설정
- 로그인 페이지 `/auth/login`: 관리자 인증 진입점

## 주요 경로

### 페이지

- `src/app/page.tsx`: 공개 페이지 진입점
- `src/app/admin/page.tsx`: 관리자 대시보드 진입점
- `src/app/auth/login/page.tsx`: 관리자 로그인 페이지

### API

- `src/app/api/comments/route.ts`
  - `GET`: 공개 댓글 목록 조회
  - `POST`: 댓글 등록
- `src/app/api/comments/[id]/like/route.ts`
  - `POST`: 댓글 좋아요 증가
- `src/app/api/admin/settings/route.ts`
  - `GET`: 관리자 설정 조회
  - `POST`: 유튜브 URL 저장
- `src/app/api/admin/export/route.ts`
  - `GET`: 댓글 CSV 다운로드

### 서버 로직

- `src/lib/comments.ts`: 댓글 저장, 조회, 좋아요 증가, 관리자 통계 계산
- `src/lib/site-settings.ts`: `site_settings` 테이블 접근
- `src/lib/admin-auth.ts`: 관리자 이메일 허용 여부 확인
- `src/lib/supabase/env.ts`: 환경변수 존재 여부 판별

### 스키마

- `supabase/schema.sql`
  - `comment_submissions`
  - `public_comments`
  - `site_settings`
  - `increment_public_comment_like` 함수

## 환경변수

필수 환경변수 이름만 관리한다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

의미:

- 공개 페이지는 최소한 공개 Supabase 키가 있어야 정상 동작한다.
- 관리자/서버 쓰기 작업은 `SUPABASE_SERVICE_ROLE_KEY`가 필요하다.
- 관리자 접근 허용은 `ADMIN_EMAILS`에 포함된 이메일만 가능하다.

## 데이터 흐름

### 공개 댓글 등록

1. 사용자가 `/`에서 폼 제출
2. `POST /api/comments`
3. `createCommentSubmission()` 실행
4. `comment_submissions` 저장
5. 트리거 또는 동기화 로직으로 `public_comments` 반영
6. 공개 목록은 `getPublicComments()`로 렌더

### 좋아요

1. 사용자가 공개 댓글 좋아요 클릭
2. `POST /api/comments/[id]/like`
3. `increment_public_comment_like()` RPC 실행
4. `public_comments.like_count` 증가

### 관리자 설정

1. 관리자 로그인 후 `/admin` 진입
2. `requireAdminUser()`로 허용 이메일 검증
3. `site_settings`에서 유튜브 URL 조회
4. 관리자 설정 카드에서 `/api/admin/settings`로 저장

## 운영상 주의점

- 댓글 등록과 관리자 화면은 서비스 역할 키 의존성이 크다.
- 스키마와 코드가 어긋나면 댓글 좋아요와 설정 저장이 먼저 깨진다.
- 현재 검증 체계는 빌드 중심이다. 자동 테스트가 없으므로 UI와 API 스모크 체크를 직접 수행해야 한다.
