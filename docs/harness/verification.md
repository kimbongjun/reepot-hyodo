# Verification

## 검증 원칙

이 프로젝트는 현재 자동 테스트가 없으므로 아래 3단계를 기본 검증선으로 본다.

1. 정적 검증: 빌드가 통과해야 한다.
2. 기능 검증: 핵심 사용자 흐름이 수동으로 동작해야 한다.
3. 데이터 검증: Supabase 테이블과 함수가 코드 기대값과 맞아야 한다.

## 기본 검증 명령

```bash
npm run build
```

현재 스크립트 기준에서 가장 신뢰할 수 있는 최소 검증이다.

## 수동 스모크 체크

### 공개 페이지

- `/` 접속 시 에러 없이 렌더되는지 확인
- 댓글 목록이 보이는지 확인
- 댓글 등록 후 성공 응답이 오는지 확인
- 새 댓글이 공개 목록에 반영되는지 확인
- 좋아요 클릭 시 수치가 증가하는지 확인
- 유튜브 URL이 설정된 경우 섹션이 노출되는지 확인

### 관리자 페이지

- `/admin` 비로그인 상태에서 `/auth/login`으로 이동하는지 확인
- 허용 이메일 로그인 후 대시보드가 보이는지 확인
- 통계 카드와 표가 렌더되는지 확인
- CSV 다운로드가 되는지 확인
- 유튜브 URL 저장 후 새로고침해도 유지되는지 확인

## API 스모크 체크 기준

브라우저 또는 API 클라이언트로 아래를 확인한다.

- `GET /api/comments`: 배열 JSON 반환
- `POST /api/comments`: 정상 입력 시 성공, 잘못된 입력 시 `400`
- `POST /api/comments/[id]/like`: 정상 댓글 ID에 대해 증가된 수치 반환
- `GET /api/admin/settings`: 관리자 세션 없으면 `401`
- `POST /api/admin/settings`: 관리자 세션에서 설정 저장
- `GET /api/admin/export`: 관리자 세션에서 CSV 다운로드

## 데이터 검증 포인트

Supabase에서 아래를 직접 확인한다.

- `comment_submissions`에 신규 행이 생성되는지
- `public_comments`에 공개용 행이 반영되는지
- `public_comments.like_count`가 증가하는지
- `site_settings`에 `youtube_url` 키가 저장되는지

## 변경 유형별 추가 검증

### UI 텍스트/레이아웃 수정

- `npm run build`
- 수정한 페이지 수동 확인

### API/서버 로직 수정

- `npm run build`
- 관련 API 직접 호출
- Supabase 데이터 반영 확인

### 스키마 수정

- `supabase/schema.sql` 재적용
- 해당 기능 전체 흐름 재검증

## 검증 결과 기록 권장 형식

배포 전 또는 작업 종료 시 아래 형식으로 남긴다.

```md
- build: pass
- public page smoke: pass
- admin login: pass
- comments create: pass
- comment like: pass
- youtube settings save: pass
- schema sync checked: pass
```
