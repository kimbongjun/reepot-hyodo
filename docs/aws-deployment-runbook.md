# AWS 이전 배포 런북

## 1. 현재 프로젝트 판단

이 프로젝트는 현재 상태 그대로는 `S3 단독 정적 호스팅`으로 배포할 수 없습니다.

코드 기준 근거:

- `src/app/page.tsx`에서 `dynamic = "force-dynamic"`와 `revalidate = 0` 사용
- `src/app/api/**/route.ts`에서 Next.js API Route 사용
- `src/lib/supabase/server.ts`, `src/lib/comments.ts`에서 서버 사이드 Supabase 접근 사용
- `src/lib/admin-auth.ts`, `src/app/admin/page.tsx`에서 서버 인증 검사 사용
- 요청 시점 세션/인증 처리를 위한 미들웨어 사용

따라서 현재 프로젝트의 권장 AWS 구조는 아래와 같습니다.

- 소스 중앙 관리: GitHub
- 웹 배포: AWS Amplify Hosting
- DNS: Amazon Route 53
- SSL: Amplify 관리 인증서 또는 ACM 관리 인증서

중요:

- `S3 또는 Amplify` 구조에서는 `Let's Encrypt + cron`을 쓰지 않습니다.
- `Let's Encrypt + certbot + cron`은 `EC2 + Nginx` 같은 서버 직접 운영 구조에 맞는 방식입니다.

## 2. 가장 큰 선행 리스크

현재 `package.json` 기준 주요 버전:

- `next: ^16.0.0`에서 `Next.js 15` 계열로 조정 필요
- `react: ^19.1.0`
- `react-dom: ^19.1.0`

Amplify 호환성을 높이려면 운영 배포 전에 `staging` 브랜치 기준으로 먼저 검증해야 합니다.

추가 주의:

- 현재 프로젝트는 루트에 `src/proxy.ts`를 사용 중이었으므로 `Next.js 15` 규약에 맞게 `src/middleware.ts`로 전환이 필요합니다.

## 3. 필수 환경변수

현재 앱이 실제로 사용하는 환경변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

Amplify에는 최소 아래 두 브랜치에 모두 설정합니다.

- `staging`
- `main`

주의사항:

- `NEXT_PUBLIC_*` 값은 브라우저에 노출되는 값입니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 비밀값입니다.
- `ADMIN_EMAILS`는 콤마로 구분된 이메일 allowlist 형식으로 관리합니다.

## 4. 보안 사전 조치

1. `.env.local`이 Git에 올라가지 않았는지 확인합니다.
2. 현재 `SUPABASE_SERVICE_ROLE_KEY`가 외부에 노출되었을 가능성이 있으면 운영 전환 전에 키를 회전합니다.
3. 운영 비밀값은 Git이 아니라 Amplify 환경변수에만 저장합니다.
4. Amplify, Route 53, S3 접근 권한은 IAM으로 최소 권한 원칙으로 제한합니다.

## 5. GitHub 브랜치 운영 권장안

추천 브랜치:

- `main`: 운영
- `staging`: 사전 검증
- `feature/*`: 개발

권장 흐름:

- `feature/*`에서 개발
- `staging`으로 병합 후 Amplify 사전 검증
- 검증 완료 후 `main` 병합 및 운영 배포

## 6. Amplify 배포 절차

### 6.1 Amplify 앱 생성

1. AWS Console에 접속합니다.
2. Amplify 서비스로 이동합니다.
3. 새 앱을 생성합니다.
4. Git provider로 GitHub를 선택합니다.
5. 현재 저장소를 연결합니다.
6. 첫 배포 브랜치는 `staging`으로 선택합니다.

### 6.2 빌드 설정

자동 감지가 충분하지 않으면 루트의 `amplify.yml`을 사용합니다.

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 6.3 Amplify 환경변수 등록

Amplify Console에 아래 값을 등록합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

### 6.4 첫 배포에서 확인할 항목

- 빌드 성공 여부
- Next.js 버전 호환 오류 여부
- 관리자 로그인 동작 여부
- API Route 정상 응답 여부
- Supabase 읽기/쓰기 정상 여부
- 세션 쿠키 및 리다이렉트 정상 여부

## 7. Route 53 서브도메인 연결

목표 도메인:

- `campaign.reepot.com`

진행 순서:

1. Amplify 앱에 들어갑니다.
2. `Hosting -> Custom domains`로 이동합니다.
3. 도메인 `reepot.com`을 추가합니다.
4. 서브도메인 `campaign`을 운영 브랜치에 매핑합니다.
5. 안내가 나오면 Amplify가 Route 53 레코드를 생성 또는 수정하도록 허용합니다.
6. DNS 검증과 인증서 발급이 완료될 때까지 대기합니다.

사전 검증용 서브도메인이 필요하면 아래 형태도 가능합니다.

- `staging-campaign.reepot.com` -> `staging`

## 8. SSL 전략

현재 아키텍처에서 맞는 방식:

- Amplify 관리 인증서
- ACM Public Certificate

권장:

- `campaign.reepot.com`에 대해 Amplify 관리 인증서 사용

사용하지 말아야 할 방식:

- S3에 certbot 설치
- Amplify에 certbot 설치
- Let's Encrypt를 cron으로 자동 갱신

이 방식들은 관리형 호스팅과 구조적으로 맞지 않습니다.

## 9. staging 배포 검증 체크리스트

1. 메인 페이지 접속
2. 댓글 등록
3. Supabase 저장 확인
4. 새로고침 후 댓글 재조회 확인
5. 좋아요 기능 확인
6. `/auth/login` 접속
7. `ADMIN_EMAILS`에 포함된 계정으로 로그인
8. `/admin` 접속
9. 통계/댓글 목록 렌더링 확인
10. 관리자 수정/삭제 동작 확인
11. CSV export 기능 사용 시 다운로드 확인
12. 권한 없는 사용자 차단 확인

## 10. 운영 도메인 연결 후 체크리스트

1. `https://campaign.reepot.com` 접속
2. 인증서 정상 여부 확인
3. Mixed Content, 쿠키, 리다이렉트 문제 확인
4. staging 체크리스트 전체 재실행

## 11. 롤백 계획

운영 배포 실패 시:

1. `main` 추가 배포를 중단합니다.
2. Amplify에서 마지막 정상 배포 버전으로 되돌립니다.
3. 버전 호환 이슈라면 운영은 기존 버전으로 유지하고 수정은 `staging`에서 재검증합니다.
4. `staging` 통과 후에만 운영 재배포합니다.

## 12. 운영 메모

- Route 53 전파에는 시간이 걸릴 수 있습니다.
- 관리형 인증서 발급에도 일정 시간이 필요할 수 있습니다.
- 첫 운영 배포 후 CloudWatch에서 SSR/API 런타임 오류를 확인하는 것이 좋습니다.
- 배포 구조는 `GitHub -> Amplify`로 단순화하는 것이 현재 프로젝트에 가장 적합합니다.

## 13. 실제 권장 실행 순서

1. `supabase/schema.sql` 적용 여부 확인
2. `staging` 브랜치 생성
3. Next.js 15 기준 로컬 검증
4. Amplify 앱 생성
5. 환경변수 등록
6. `staging` 배포
7. 배포 오류 수정
8. `campaign.reepot.com` 연결
9. `main` 운영 배포 활성화
10. 운영 검증 완료

## 14. 최종 운영 구조 요약

최종적으로 운영 구조는 아래처럼 가져갑니다.

- 개발 및 형상관리: GitHub
- 자동 배포: Amplify
- 운영 도메인: `campaign.reepot.com`
- DNS 관리: Route 53
- SSL: Amplify 관리 인증서

즉, 코드 변경 후 GitHub 브랜치에 push 하면 Amplify가 이를 받아 자동으로 빌드하고 배포하는 흐름으로 운영합니다.
