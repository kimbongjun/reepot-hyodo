# Harness Guide

이 디렉토리는 이 프로젝트를 `harness` 관점에서 빠르게 이해하고 실행, 검증, 배포하기 위한 운영 문서 모음이다.

## 문서 구성

- [project-context.md](./project-context.md): 프로젝트 구조, 핵심 진입점, 환경변수, 데이터 흐름
- [local-runbook.md](./local-runbook.md): 로컬 실행과 초기 세팅 절차
- [verification.md](./verification.md): 변경 후 검증 기준과 실제 확인 순서
- [deployment.md](./deployment.md): 배포 전 체크, 배포 순서, 배포 후 확인
- [operations.md](./operations.md): 운영 중 자주 보는 항목과 장애 대응 시작점

## 빠른 시작

1. [project-context.md](./project-context.md)로 구조와 의존성을 확인한다.
2. [local-runbook.md](./local-runbook.md) 순서대로 로컬 환경을 맞춘다.
3. 변경 후 [verification.md](./verification.md) 체크리스트를 수행한다.
4. 배포가 필요하면 [deployment.md](./deployment.md) 순서로 진행한다.

## 현재 기준

- 프레임워크: Next.js App Router
- 패키지 매니저: `npm`
- 데이터 저장소: Supabase
- 관리자 접근 제어: Supabase Auth + `ADMIN_EMAILS`
- 핵심 검증 명령: `npm run build`

## 주의

- 이 프로젝트는 현재 `test` 스크립트가 없다.
- 문서에 환경변수 이름은 적지만 실제 값은 적지 않는다.
- Supabase 스키마 변경이 있으면 `supabase/schema.sql`을 SQL Editor에서 다시 반영해야 한다.
