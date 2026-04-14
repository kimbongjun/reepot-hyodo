# Local Runbook

## 1. 선행 조건

- Node.js 20+ 권장
- `npm` 사용
- Supabase 프로젝트 접근 권한
- `.env.local` 파일 준비

## 2. 의존성 설치

```bash
npm install
```

## 3. 환경변수 설정

`.env.local`에 아래 키를 설정한다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
```

규칙:

- `ADMIN_EMAILS`는 쉼표로 구분한다.
- 서비스 역할 키는 클라이언트 코드에 노출하지 않는다.

## 4. Supabase 스키마 반영

`supabase/schema.sql` 내용을 Supabase SQL Editor에서 실행한다.

다음 경우에는 반드시 다시 반영한다.

- 새 테이블 또는 컬럼 추가
- 좋아요 로직 수정
- `site_settings` 관련 수정
- RLS 또는 함수 정의 변경

## 5. 로컬 서버 실행

```bash
npm run dev
```

기본 확인 URL:

- 공개 페이지: `http://localhost:3000`
- 관리자 페이지: `http://localhost:3000/admin`
- 로그인 페이지: `http://localhost:3000/auth/login`

## 6. 빌드 검증

개발 중 정상처럼 보여도 배포 단계에서 실패할 수 있으므로 빌드는 별도로 확인한다.

```bash
npm run build
```

## 7. 자주 발생하는 문제

### 공개 페이지는 열리지만 등록이 안 됨

- `SUPABASE_SERVICE_ROLE_KEY` 누락 여부 확인
- `supabase/schema.sql` 최신 반영 여부 확인

### 관리자 페이지가 로그인으로 튕김

- 로그인 계정 이메일이 `ADMIN_EMAILS`에 포함됐는지 확인
- Supabase Auth 세션이 유효한지 확인

### 유튜브 URL 저장이 안 됨

- `site_settings` 테이블 존재 여부 확인
- `/api/admin/settings`가 `401` 또는 `400`을 반환하는지 확인

### 좋아요가 증가하지 않음

- `increment_public_comment_like` 함수 존재 여부 확인
- `public_comments.like_count` 컬럼 존재 여부 확인
