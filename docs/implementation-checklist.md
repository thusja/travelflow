# TravelFlow Implementation Checklist

목적: 설계 문서를 실제 구현으로 옮길 때 누락 방지
원칙: 각 항목은 완료 시 체크, 이슈가 있으면 옆에 메모 남김

## 1) 공통 준비

- [x] 환경변수 키 목록 확정 (`.env.example` 갱신)
- 메모: [server/.env.example](server/.env.example) 기준 `PORT`, `NODE_ENV`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `EXCHANGE_API_KEY`, `WEATHER_API_KEY`, `VITE_WEATHER_API_KEY`, `SMOKE_USER_ID` 정리
- [x] 개발/스테이징/운영 환경 분리 전략 확정
- 메모: [docs/environment-strategy.md](docs/environment-strategy.md) 작성 및 [server/.env.development.example](server/.env.development.example), [server/.env.staging.example](server/.env.staging.example), [server/.env.production.example](server/.env.production.example) 템플릿 추가
- [x] 기존 더미 데이터 제거 대상 목록 작성
- 메모: 더미 전환 추적 문서 [docs/dummy-removal-targets.md](docs/dummy-removal-targets.md) 작성
- [x] 에러 코드 표준(`api-spec.md`) 기준으로 서버 응답 포맷 통일
- 메모: [server/utils/apiResponse.js](server/utils/apiResponse.js) 공통 유틸 추가, 주요 라우트/컨트롤러에서 `success=false`, `error.code`, `message`, `meta` 에러 포맷 적용

## 2) Supabase + Prisma

- [x] Supabase 프로젝트 생성 및 PostgreSQL 연결 확인
- [x] Prisma 초기화 및 `schema.prisma` 작성
- [x] 핵심 모델 반영: user_profiles, bookings, reviews, points_ledger, coupons, user_coupons, refresh_tokens, job_runs
- 메모: 네이밍 매핑으로 반영 완료 (`user_profiles -> users`, `points_ledger -> point_histories`), `refresh_tokens`/`job_runs` 포함([server/prisma/schema.prisma](server/prisma/schema.prisma))
- [x] Prisma migration 적용 및 롤백 절차 검증
- 메모: baseline migration 생성([server/prisma/migrations/20260618_init_baseline/migration.sql](server/prisma/migrations/20260618_init_baseline/migration.sql)) 후 `rehearsal_20260618` 스키마에서 deploy/rollback 리허설 완료([docs/prisma-migration-rehearsal.md](docs/prisma-migration-rehearsal.md))
- [x] RLS/Policy는 SQL migration으로 분리 관리
- 메모: 정책 SQL/롤백 파일([server/sql/policies/20260618_rls_policies.sql](server/sql/policies/20260618_rls_policies.sql), [server/sql/policies/20260618_rls_policies.rollback.sql](server/sql/policies/20260618_rls_policies.rollback.sql)) 및 실행/검증 스크립트([server/scripts/applyPolicies.js](server/scripts/applyPolicies.js), [server/scripts/checkRlsPolicies.js](server/scripts/checkRlsPolicies.js)) 추가, `rehearsal_policy_20260618`에서 검증(`rlsEnabledTables=11`, `policyCount=23`) 완료([docs/rls-policy-migration.md](docs/rls-policy-migration.md))
- [x] Storage 버킷(프로필/리뷰 이미지) 생성 및 접근 정책 설정
- 메모: 버킷/정책 SQL([server/sql/storage/20260618_storage_buckets.sql](server/sql/storage/20260618_storage_buckets.sql), [server/sql/storage/20260618_storage_buckets.rollback.sql](server/sql/storage/20260618_storage_buckets.rollback.sql)), 검증 스크립트([server/scripts/checkStorageSetup.js](server/scripts/checkStorageSetup.js)), 운영 가이드 [docs/storage-buckets-policy.md](docs/storage-buckets-policy.md) 추가 및 실검증 완료(`bucketCount=2`, `policyCount=8`)

## 3) 인증 (Access/Refresh JWT)

- [x] AccessToken 만료 시간 설정(권장 10~30분)
- [x] RefreshToken 만료 시간 설정(권장 7~30일)
- [x] RefreshToken 해시 저장 및 회전(rotation) 로직 구현
- [x] 로그인/재발급/로그아웃/전체로그아웃 API 구현
- 메모: access 15m, refresh 14d 기본값 적용([server/.env.example](server/.env.example))
- 메모: refresh token은 SHA-256 해시로 DB 저장 + 재발급 시 회전/이전 토큰 폐기([server/controllers/authController.js](server/controllers/authController.js), [server/prisma/schema.prisma](server/prisma/schema.prisma))
- 메모: 신규 API [server/routes/auth.js](server/routes/auth.js) 기준 `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/logout-all` 추가
- [x] 클라이언트 refresh 단일 큐 처리(동시 401 방지)
- [x] refresh 실패 시 공통 로그아웃 및 로그인 유도 UX 처리
- 메모: [client/src/utils/httpClient.js](client/src/utils/httpClient.js) 전역 fetch 인터셉터에서 401 시 refresh 단일 promise 큐로 재시도 처리
- 메모: refresh 실패 시 `auth:logout-required` 이벤트 발행 후 [client/src/contexts/AuthContext.jsx](client/src/contexts/AuthContext.jsx)에서 공통 로그아웃 + 로그인 페이지 이동 처리

## 4) Redis 캐시

- [x] Redis 연결 및 장애 시 폴백 동작 정의
- [x] 캐시 키 규칙 확정(`domain:resource:param`)
- [x] TTL 정책 적용(패키지/쿠폰/외부 API 중계)
- [x] mutation 후 Query invalidation 규칙 적용
- [x] 블랙리스트 또는 세션 보조키 운영 정책 확정
- 메모: mutation 성공 시 접두사 무효화 규칙 적용([server/utils/cacheStore.js](server/utils/cacheStore.js), [server/routes/bookings.js](server/routes/bookings.js), [server/routes/pointAndCoupon.js](server/routes/pointAndCoupon.js)), 세션/블랙리스트 운영 기준 문서화([docs/redis-cache-strategy.md](docs/redis-cache-strategy.md))

## 5) 스케줄러 (BullMQ) - 보류

- 메모: 현재 단계에서는 스케줄러 도입을 보류하고, 실제 스케줄 실행 요구가 생길 때 재개한다.
<!--
- [ ] Queue/Worker 분리 구성
- [ ] 쿠폰 만료 상태 업데이트 잡 등록
- [ ] 리마인더 발송 enqueue 잡 등록
- [ ] 포인트 만료 처리 잡 등록
- [ ] 재시도/백오프/최대시도 정책 설정
- [ ] 실패 알림 및 `job_runs` 로깅 구현
      -->

## 6) API/프론트 정합성

- [x] 리뷰 요청 필드 불일치 해결 (`content` vs `comment`)
- [x] 탈퇴 API 경로 불일치 해결 (`/users` vs `/users/me`)
- [x] 로그인 중복 호출 제거(호출 계층 단일화)
- [x] 목록 API에 page/size/sort/filter 규약 적용
- [x] 멱등성 키 적용 대상 API 구현(예약 생성/취소/쿠폰 등록)
- 메모: 로그인 API 호출은 [client/src/components/Login/LoginForm.jsx](client/src/components/Login/LoginForm.jsx#L37) 한 곳에서만 수행됨
- 메모: packages, review/reviewable, users/logs 엔드포인트에 page/size/sort/filter 적용 (기존 응답 포맷 호환 유지)
- 메모: 쿠폰 등록([server/routes/pointAndCoupon.js](server/routes/pointAndCoupon.js)), 예약 생성/취소([server/routes/bookings.js](server/routes/bookings.js))에 Idempotency-Key + DB 저장(idempotency_requests) 적용 완료
- 메모: wireframe/workflow 미완 MVP였던 플래너/여행 제안을 API+DB로 연결 완료([server/routes/planner.js](server/routes/planner.js), [server/routes/suggestions.js](server/routes/suggestions.js), [client/src/pages/PlannerPage.jsx](client/src/pages/PlannerPage.jsx), [client/src/pages/SuggestPage.jsx](client/src/pages/SuggestPage.jsx))
- 메모: 스모크 테스트 완료(`POST/GET /api/planner`, `POST/GET /api/suggestions`) - 생성된 샘플 ID 확인(`9ceb0189-d9c1-4561-902b-fc986d7f687f`, `c6848216-56dc-4be2-99a4-53b8a0660d75`)
- 메모: UTF-8 스모크 스크립트 추가([server/scripts/smokePlannerSuggestApi.js](server/scripts/smokePlannerSuggestApi.js), `npm run smoke:planner-suggestions`) 및 한글 payload 저장/조회 검증 PASS (샘플 ID: `38054d60-bd68-436d-8201-37fa9e6b7e9c`, `462578a0-da4a-4556-ac45-4e7bc8ac9e85`)
- 메모: 플래너 수정/삭제 MVP 반영(`PUT /api/planner/:id`, `DELETE /api/planner/:id`) 및 스모크 검증 PASS(`plannerUpdateDelete=PASS`, 샘플 ID: `61168026-7c2c-4a87-a835-4bc49f39f125`)
- 메모: 여행 제안 상태 관리 MVP 반영(`PATCH /api/suggestions/:id/status`, `received/reviewed`) 및 화면 관리 액션 추가([server/routes/suggestions.js](server/routes/suggestions.js), [client/src/pages/SuggestPage.jsx](client/src/pages/SuggestPage.jsx))

## 7) 상태 구조/클라이언트

- [x] 공통 `httpClient`에 토큰/재시도/에러 처리 통합
- 메모: [client/src/utils/httpClient.js](client/src/utils/httpClient.js) 기반으로 API 요청 토큰 주입, 401 재시도, refresh 실패 처리 통합
- [x] TanStack Query key 네이밍/무효화 매트릭스 반영
- 메모: 기준 문서 [docs/query-invalidation-matrix.md](docs/query-invalidation-matrix.md) 작성 + Query Provider([client/src/app/QueryProvider.jsx](client/src/app/QueryProvider.jsx)) 및 key 유틸([client/src/utils/queryKeys.js](client/src/utils/queryKeys.js)) 도입, 주요 조회 화면([client/src/components/Home/Packages.jsx](client/src/components/Home/Packages.jsx), [client/src/pages/PackagePage.jsx](client/src/pages/PackagePage.jsx), [client/src/components/Profiles/myBookings/History.jsx](client/src/components/Profiles/myBookings/History.jsx), [client/src/components/Profiles/myBookings/Cancel.jsx](client/src/components/Profiles/myBookings/Cancel.jsx)) useQuery 전환
- [x] localStorage/memory/cookie persistence 정책 반영
- 메모: 인증 저장소 유틸 [client/src/utils/authStorage.js](client/src/utils/authStorage.js) 추가 및 핵심 호출부([client/src/contexts/AuthContext.jsx](client/src/contexts/AuthContext.jsx), [client/src/utils/httpClient.js](client/src/utils/httpClient.js), [client/src/components/Common/PrivateRoute.jsx](client/src/components/Common/PrivateRoute.jsx)) 반영
- [x] 공통 로딩/빈상태/오류 상태 컴포넌트 적용
- 메모: 공통 상태 컴포넌트([client/src/components/Common/LoadingState.jsx](client/src/components/Common/LoadingState.jsx), [client/src/components/Common/EmptyState.jsx](client/src/components/Common/EmptyState.jsx), [client/src/components/Common/ErrorState.jsx](client/src/components/Common/ErrorState.jsx)) 추가 및 주요 화면 적용([client/src/components/Home/Packages.jsx](client/src/components/Home/Packages.jsx), [client/src/pages/PackagePage.jsx](client/src/pages/PackagePage.jsx), [client/src/components/Profiles/myBookings/History.jsx](client/src/components/Profiles/myBookings/History.jsx), [client/src/components/Profiles/myBookings/Cancel.jsx](client/src/components/Profiles/myBookings/Cancel.jsx), [client/src/components/Profiles/myBookings/BookingDetail.jsx](client/src/components/Profiles/myBookings/BookingDetail.jsx))

## 8) 테스트/배포 게이트 - 보류

- 메모: 현재 단계에서는 테스트/배포 게이트를 보류하고, 기능 범위 확정 후 재개한다.
<!--
- [ ] 인증 시나리오 테스트(로그인, 재발급, 만료, 로그아웃)
- [ ] 예약/후기/쿠폰 핵심 E2E 테스트 통과
- [ ] 캐시 히트/미스/무효화 테스트 통과
- [ ] 스케줄 잡 성공/재시도/실패 알림 테스트 통과
- [ ] 마이그레이션 리허설(백업/복구/롤백) 완료
- [ ] 운영 배포 체크(모니터링, 알림, 로그) 완료
      -->

## 9) 완료 기준 (Definition of Done) - 보류

- 메모: 현재 단계에서는 완료 기준 평가는 보류하고, 7번 섹션 이후 항목 재개 시점에 함께 검증한다.
<!--
- [ ] 더미 데이터 기반 화면이 모두 실데이터 기반으로 전환됨
- 메모: myBookings의 history/cancel/detail, booking 페이지 예약 생성은 `/api/bookings` 실데이터 연동 완료
- 메모: packages API는 [server/routes/packages.js](server/routes/packages.js) 기준 Prisma package 테이블 조회로 전환 완료
- [ ] Access/Refresh 인증이 전 구간에서 일관되게 동작함
- [ ] 캐시/스케줄/토큰 관련 장애 시 폴백 경로가 검증됨
- [ ] 문서 5종과 실제 코드/DB/API 상태가 일치함
      -->
