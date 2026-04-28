# CLAUDE.md — reepot-hyodo

이 파일은 Claude가 이 프로젝트를 다룰 때 참고하는 컨텍스트 문서다.
운영 절차 상세는 `docs/harness/` 디렉토리를 참조한다.

---

## 프로젝트 개요

**리팟 효도 캠페인 이벤트** 사이트.
공개 이벤트 참여 페이지와 관리자 운영 대시보드를 함께 제공한다.

- 공개 페이지 `/`: 참여 폼 등록, 실시간 댓글 피드, 좋아요, 유튜브 섹션
- 관리자 페이지 `/admin`: 참여 데이터 집계, 통계, 설정 편집, CSV 내보내기
- 로그인 페이지 `/auth/login`: 관리자 전용 진입점

배포 대상 도메인: `campaign.reepot.com` (AWS Amplify + Route 53)

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 15.5 (App Router), React 19.1 |
| 언어 | TypeScript 5.8 (strict) |
| 스타일링 | Tailwind CSS 3.4, clsx, tailwind-merge |
| 백엔드 | Next.js API Routes (서버 컴포넌트 + Route Handlers) |
| DB / Auth | Supabase (PostgreSQL + Supabase Auth) |
| 패키지 매니저 | npm |
| 아이콘 | lucide-react |
| 상태관리 | Zustand (최소 사용) |

---

## 디렉토리 구조

```
src/
├── app/
│   ├── page.tsx                        # 공개 이벤트 페이지 (force-dynamic)
│   ├── layout.tsx                      # 루트 레이아웃, 메타데이터
│   ├── globals.css                     # 전역 스타일, CSS 변수, 색상 테마
│   ├── admin/page.tsx                  # 관리자 대시보드 (force-dynamic)
│   ├── auth/login/                     # 관리자 로그인
│   └── api/
│       ├── comments/route.ts           # GET·POST 공개 댓글
│       ├── comments/[id]/like/route.ts # POST 좋아요 증가
│       └── admin/
│           ├── settings/route.ts       # POST 사이트 설정 저장
│           ├── export/route.ts         # GET CSV 내보내기
│           ├── admins/route.ts         # GET·POST 관리자 계정
│           ├── admins/[email]/route.ts # PATCH·DELETE 관리자 편집
│           ├── comments/[id]/route.ts  # DELETE·PATCH 댓글 관리
│           └── upload/route.ts         # POST 이미지 업로드
├── lib/
│   ├── types.ts                        # 전체 타입 정의
│   ├── comments.ts                     # 댓글 CRUD, 유효성 검사, 통계
│   ├── site-settings.ts                # site_settings 테이블 접근
│   ├── admin-auth.ts                   # 관리자 이메일 검증, requireAdminUser()
│   ├── admin-emails.ts                 # ADMIN_EMAILS 환경변수 파싱
│   ├── middleware.ts                   # 세션 갱신 + 어드민 경로 보호
│   ├── request-meta.ts                 # IP·지역 메타 추출
│   ├── youtube.ts                      # YouTube URL → embed URL 변환
│   ├── csv.ts                          # CSV 수식 인젝션 방어, RFC4180 출력
│   ├── utils.ts                        # cn() Tailwind 헬퍼
│   ├── server.ts                       # SSR용 Supabase 클라이언트
│   ├── client.ts                       # 브라우저용 Supabase 클라이언트
│   └── supabase/
│       ├── env.ts                      # hasPublicSupabaseEnv, hasServiceSupabaseEnv
│       ├── server.ts                   # createServiceSupabaseClient() — 서비스 롤
│       └── client.ts                   # createBrowserSupabaseClient()
├── components/
│   ├── event/                          # 공개 페이지 컴포넌트
│   │   ├── event-page.tsx              # 공개 페이지 컨테이너 (서버)
│   │   ├── hero-section.tsx
│   │   ├── youtube-section.tsx         # "use client" — 썸네일 탭, 스와이프
│   │   ├── comment-form.tsx            # "use client" — 참여 폼
│   │   ├── comment-feed.tsx            # "use client" — 실시간 피드, 좋아요
│   │   ├── event-cards-section.tsx     # 경품 카드
│   │   └── footer-section.tsx
│   ├── admin/                          # 관리자 대시보드 컴포넌트
│   │   ├── admin-dashboard.tsx         # 대시보드 컨테이너 (서버)
│   │   ├── youtube-settings-card.tsx   # "use client" — 탭형 설정 편집기
│   │   ├── admin-management-card.tsx   # "use client" — 관리자 계정 관리
│   │   ├── comments-table.tsx          # "use client" — 댓글 테이블
│   │   ├── stats-cards.tsx
│   │   ├── hourly-chart.tsx
│   │   ├── distribution-chart.tsx
│   │   ├── thumbnail-upload.tsx        # "use client" — 이미지 업로드
│   │   └── logout-button.tsx
│   └── ui/                             # Shadcn 스타일 기본 컴포넌트
│       ├── button.tsx, badge.tsx, card.tsx, input.tsx, ...
middleware.ts                           # Next.js 미들웨어 진입점
supabase/schema.sql                     # PostgreSQL 스키마, 트리거, RLS
tailwind.config.ts                      # 색상 토큰 정의
docs/harness/                           # 운영 정책 문서 (아래 참조)
```

---

## 환경변수

`.env.local`에 아래 키를 설정한다. 값은 Git에 커밋하지 않는다.

```env
NEXT_PUBLIC_SUPABASE_URL=        # 공개 API 엔드포인트 (브라우저 노출)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # 공개 Anon 키 (브라우저 노출)
SUPABASE_SERVICE_ROLE_KEY=       # 서비스 롤 키 — 서버 전용, 절대 클라이언트 노출 금지
ADMIN_EMAILS=                    # 쉼표 구분 허용 이메일 목록
```

- 공개 페이지 읽기/쓰기는 `SUPABASE_SERVICE_ROLE_KEY` 필요
- 관리자 접근은 `ADMIN_EMAILS`에 포함된 이메일 + Supabase Auth 세션 필요

---

## 핵심 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (localhost:3000)
npm run typecheck    # TypeScript 타입 오류만 체크 (빌드보다 빠름)
npm run build        # 빌드 검증 — 배포 전 반드시 통과 확인
npm start            # 프로덕션 서버
```

**자동화 테스트 없음.** 변경 후 검증은 `npm run typecheck` 또는 `npm run build` + 수동 스모크 체크로 진행.
상세 검증 절차는 `docs/harness/verification.md` 참조.

---

## 아키텍처 핵심 패턴

### 1. Supabase 클라이언트 구분

| 클라이언트 | 파일 | 용도 |
|---|---|---|
| `createServiceSupabaseClient()` | `src/lib/supabase/server.ts` | 서버 전용, 서비스 롤 키 사용, RLS 우회 |
| `createClient()` (SSR) | `src/lib/server.ts` | 쿠키 기반 세션 처리, Auth 검증 |
| `createBrowserSupabaseClient()` | `src/lib/supabase/client.ts` | 브라우저 전용, Realtime 구독 |

### 2. 관리자 인증 흐름

```
요청 → middleware.ts → 세션 확인 → admin-auth.ts
  → isAllowedAdminEmailAsync() → ADMIN_EMAILS(env) 또는 admin_users(DB)
  → 미인증: /auth/login 리다이렉트 / API: 401 반환
```

- `requireAdminUser()`: 페이지 서버 컴포넌트에서 사용, 비허가 시 redirect
- `getAdminUser()`: API Route에서 사용, 비허가 시 null 반환

### 3. 관리자 역할(role)

`admin_users` 테이블에 `role` 컬럼 (`admin` | `superadmin`)이 있으나
현재 기능 차이 없음 — 역할과 무관하게 모든 관리자가 동일 권한을 가짐.

### 4. 댓글 데이터 이중 구조

```
comment_submissions (전체 PII + 메타)
        ↓ PostgreSQL 트리거
public_comments (닉네임, 메시지, 좋아요, hidden)
        ↓ Realtime 구독
comment-feed.tsx (브라우저 실시간 반영)
```

좋아요는 `increment_public_comment_like()` RPC 함수 경유 (SECURITY DEFINER).

### 5. 사이트 설정

- `site_settings` 테이블 (key-value 구조)
- `getSiteSettings()`: 매 페이지 렌더 시 전체 로드
- `updateSiteSettings()`: 관리자 저장 시 전체 upsert
- 빈 문자열은 `normalizeSettingValue()`가 null로 정규화 → 기본값 fallback

---

## 데이터 흐름 요약

| 흐름 | 경로 |
|---|---|
| 참여 등록 | 폼 → `POST /api/comments` → `comment_submissions` → 트리거 → `public_comments` |
| 좋아요 | 버튼 → `POST /api/comments/[id]/like` → RPC `increment_public_comment_like` |
| 실시간 업데이트 | Supabase Realtime → `comment-feed.tsx` useEffect 구독 |
| 설정 저장 | 관리자 폼 → `POST /api/admin/settings` → `site_settings` upsert |
| CSV 내보내기 | 관리자 → `GET /api/admin/export` → BOM+UTF-8 CSV 스트림 |

---

## 코딩 컨벤션

### 일반

- 언어: TypeScript strict, 타입 단언보다 타입 가드 우선
- 컴포넌트: PascalCase, 파일명 kebab-case
- 함수/변수: camelCase
- DB 컬럼: snake_case
- 환경변수: SCREAMING_SNAKE_CASE

### 컴포넌트 작성 원칙

- 서버 컴포넌트 기본, 클라이언트 상호작용이 필요할 때만 `"use client"`
- `"use client"` 컴포넌트 최상단에 명시
- props 타입은 컴포넌트 파일 상단 `type Props = { ... }` 패턴

### 스타일링

- Tailwind utility class 우선
- 동적 className은 템플릿 리터럴 또는 `cn()` 사용
- `dangerouslySetInnerHTML`은 관리자가 직접 입력한 HTML 렌더링에 한해 사용
- 날짜 렌더링(`<time>`)에는 반드시 `suppressHydrationWarning` 추가 (Intl.DateTimeFormat 서버/클라이언트 차이)

### API Route 작성 원칙

- 모든 admin API는 첫 줄에 `getAdminUser()` 호출, null이면 즉시 401 반환
- 공개 API는 서버 측에서 입력 유효성 검사 후 DB 접근
- 에러 응답: `{ message: string }` 형태로 통일

---

## 색상 테마 (Tailwind 토큰)

`tailwind.config.ts`에서 정의된 커스텀 색상:

| 토큰 | 값 | 용도 |
|---|---|---|
| `brand` | `#DAC8B5` | 주요 포인트 컬러 (베이지) |
| `sky` | `#EDE4DA` | 보조 하이라이트 컬러 (크림) |
| `black` | `#393D42` | 기본 텍스트 컬러 (차콜) |

- `text-black`, `bg-black` 등은 모두 `#393D42` 적용
- `text-black/60` 같은 opacity 변형도 `#393D42` 기준
- CSS 변수(`--primary`, `--foreground` 등)는 `globals.css`에서 정의
- 하드코딩 배경색은 `#FAF8F5` (웜 오프화이트) 사용
- 댓글 피드 다크 그라디언트: `#393D42 → #4A4F56`

---

## 데이터베이스 (supabase/schema.sql)

### 주요 테이블

| 테이블 | 설명 |
|---|---|
| `comment_submissions` | 전체 참여 데이터 (닉네임, 이름, 연락처, 병원, 메시지, IP, 지역, UA) |
| `public_comments` | 공개용 서브셋 (닉네임, 메시지, like_count, hidden) |
| `site_settings` | 사이트 설정 key-value 저장소 |
| `admin_users` | DB 기반 관리자 계정 (email, role) |

### RLS 정책

- `public_comments`: SELECT — anon + authenticated 모두 허용
- `public_comments`: 직접 UPDATE 없음 (RPC 함수 경유)
- 나머지 테이블: 서비스 롤 키로만 접근

### 스키마 변경 시

`supabase/schema.sql` 수정 후 반드시 Supabase SQL Editor에서 재실행.

---

## 입력 유효성 검사 규칙

| 필드 | 규칙 |
|---|---|
| 닉네임 | 최대 30자, 필수 |
| 이름 | 최대 20자, 필수 |
| 연락처 | 숫자만, 10–11자, 필수 |
| 병원명 | 필수 (프론트엔드 required, 서버 trim) |
| 메시지 | 2–500자, 필수 |

---

## Hydration 주의사항

- `"use client"` 컴포넌트도 Next.js SSR이 서버에서 렌더링함
- `Intl.DateTimeFormat`은 Node.js와 브라우저 간 ICU 데이터 차이로 불일치 발생 → `<time suppressHydrationWarning>` 필수
- `Math.random()`, `Date.now()` 기반 초기값은 SSR 컴포넌트에서 사용 금지

---

## 운영 정책 문서 (docs/harness/)

| 문서 | 내용 |
|---|---|
| `README.md` | 문서 구성 및 빠른 시작 |
| `project-context.md` | 핵심 경로, 환경변수, 데이터 흐름 |
| `local-runbook.md` | 로컬 세팅, 스키마 반영, 자주 발생하는 문제 |
| `verification.md` | 빌드·기능·데이터 검증 기준 및 체크리스트 |
| `deployment.md` | 배포 전 체크, 권장 순서, 롤백 판단 기준 |
| `operations.md` | 일상 운영 체크, 장애 대응 시작점 |
| `../aws-deployment-runbook.md` | AWS Amplify + Route 53 배포 전체 절차 |

---

## 주요 제약 및 주의사항

1. **정적 호스팅 불가** — `force-dynamic`, API Route, 미들웨어 세션 처리로 인해 S3 단독 정적 호스팅 불가. AWS Amplify 필요.

2. **SUPABASE_SERVICE_ROLE_KEY 노출 금지** — 절대 `NEXT_PUBLIC_` 접두사 사용 금지, 클라이언트 코드에 포함 금지.
   - `supabaseServiceKey`는 `src/lib/supabase/server.ts`에서만 참조해야 함. `"use client"` 파일에 import해도 빌드는 통과하지만, Next.js가 서버 전용 env를 클라이언트 번들에서 제거하므로 런타임에서 `undefined`가 됨 — 서비스 롤 기능이 조용히 실패함.
   - 검증: `src` 전체에서 `supabaseServiceKey` 검색 결과가 `src/lib/supabase/env.ts`·`src/lib/supabase/server.ts` 두 파일에만 있어야 함.

3. **스키마 동기화** — 코드와 DB 스키마 불일치 시 댓글 좋아요·설정 저장이 먼저 깨짐.
   - 필수 트리거: `comment_submissions_sync_public` (INSERT/UPDATE → `public_comments` 복사), `comment_submissions_delete_public` (DELETE → `public_comments` 삭제)
   - 확인 쿼리: `SELECT tgname FROM pg_trigger WHERE tgrelid = 'comment_submissions'::regclass;`
   - 트리거 누락 시 `supabase/schema.sql`을 Supabase SQL Editor에서 전체 재실행.

4. **테스트 자동화 없음** — 변경 후 `npm run typecheck`(타입 체크 전용, 빠름) 또는 `npm run build`(전체) 확인 필수.
   - 최소 스모크: 공개 페이지 로드 → 자동 스크롤 없음 확인 → 댓글 등록 → 새 댓글 상단 표시·자동 포커스 → 좋아요 → 관리자 로그인 → 설정 저장

5. **관리자 역할** — `superadmin`과 `admin` role은 관리자 목록 UI 표시만 다르고 API 권한은 동일. `admin-auth.ts`의 `requireAdminUser()`·`getAdminUser()` 함수가 role을 조회하지 않으므로 role 값으로 접근 제어가 되지 않음.

6. **댓글 수집 동기화** — `public_comments`는 트리거로 자동 동기화. 트리거 누락 시 공개 피드 반영 안 됨.
   - 디버그: `comment_submissions`에 직접 INSERT 후 `public_comments`에 동일 `id` 행이 생기는지 확인. 안 생기면 트리거 재등록 필요 (`schema.sql` 재실행).

7. **초기 스크롤 방지** — `comment-feed.tsx`의 `focusedCommentId`는 반드시 `null`로 초기화해야 함. 댓글 id로 초기화하면 마운트 시 해당 댓글로 자동 스크롤됨. 실시간으로 새 댓글이 도착할 때만 `{ focus: true }` 옵션으로 스크롤이 트리거되어야 함.
