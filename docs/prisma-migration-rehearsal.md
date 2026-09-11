# Prisma Migration Rehearsal

목적: 운영 `public` 스키마를 건드리지 않고 migration 적용/롤백 절차를 검증한다.

## 검증 기준

- migration SQL 파일이 버전 디렉토리에 존재한다.
- 리허설 스키마에 `prisma migrate deploy`가 성공한다.
- 리허설 스키마에서 rollback SQL 실행 후 도메인 테이블이 제거된다.

## 이번 검증 결과

- baseline migration 생성:
  - `server/prisma/migrations/20260618_init_baseline/migration.sql`
  - `server/prisma/migrations/20260618_init_baseline/rollback.sql`
- 리허설 롤백 SQL 생성:
  - `server/prisma/migrations/20260618_init_baseline/rollback.rehearsal.sql`
- 적용 검증:
  - `schema=rehearsal_20260618` 대상 `prisma migrate deploy` 성공
- 롤백 검증:
  - rollback 실행 후 스키마 확인 결과 `remainingTables=1` (`_prisma_migrations`만 잔존)

## 재실행 절차

1. 리허설 스키마 URL 준비 (`schema=rehearsal_<date>`)
2. migration 적용
3. rollback SQL 생성 및 실행
4. 스키마 잔존 테이블 수 확인

참고: 스키마 확인 스크립트는 `server/scripts/checkSchemaTables.js`를 사용한다.
