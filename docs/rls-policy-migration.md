# RLS/Policy SQL Migration Guide

목적: Prisma migration과 분리된 SQL 파일로 Supabase RLS/Policy를 버전 관리한다.

## 파일 구조

- 정책 적용 SQL: `server/sql/policies/20260618_rls_policies.sql`
- 정책 롤백 SQL: `server/sql/policies/20260618_rls_policies.rollback.sql`
- 적용 실행 스크립트: `server/scripts/applyPolicies.js`
- 적용 검증 스크립트: `server/scripts/checkRlsPolicies.js`

## 적용 명령

기본(public 스키마) 적용:

```bash
cd server
npm run policy:apply
npm run policy:check
```

리허설 스키마 적용:

```bash
cd server
node scripts/applyPolicies.js --schema rehearsal_20260618 --file sql/policies/20260618_rls_policies.sql
node scripts/checkRlsPolicies.js rehearsal_20260618
```

롤백:

```bash
cd server
npm run policy:rollback
```

## 정책 범위

- 사용자 소유 행 접근 제한: `users`, `bookings`, `reviews`(쓰기), `point_histories`, `user_coupons`, `refresh_tokens`, `idempotency_requests`, `login_logs`, `withdrawal_logs`
- 공개 조회 허용: `packages`, `coupons`, `reviews`(읽기)

## 운영 메모

- 본 정책은 Supabase의 `auth.uid()` 기반으로 작성했다.
- 백엔드 서버 연결 계정이 RLS를 우회하는 권한인지 여부를 운영 환경에서 확인한다.
- 정책 변경은 새 SQL 파일(날짜 접두사)로 누적 관리하고 기존 파일은 수정하지 않는다.

## 리허설 검증 기록

- 검증 스키마: `rehearsal_policy_20260618`
- 적용 절차: baseline migration deploy -> 정책 SQL apply -> 정책 조회
- 검증 결과: `rlsEnabledTables=11`, `policyCount=23`
