# TravelFlow Environment Strategy

목표: 개발/스테이징/운영 환경을 명확히 분리해 설정 누락과 배포 리스크를 줄인다.

## 1. 환경 구분

- development: 로컬 개발 및 기능 확인
- staging: 배포 전 통합 검증
- production: 실제 사용자 트래픽 처리

## 2. 변수 관리 원칙

- 공통 키 스키마는 [server/.env.example](server/.env.example) 기준으로 고정한다.
- 실제 비밀값은 git에 커밋하지 않는다.
- 환경별 값은 아래 템플릿으로 관리한다.
  - [server/.env.development.example](server/.env.development.example)
  - [server/.env.staging.example](server/.env.staging.example)
  - [server/.env.production.example](server/.env.production.example)

## 3. 우선순위 및 런타임 규칙

- `NODE_ENV`로 런타임 모드를 구분한다.
- Prisma 연결 URL은 아래 우선순위를 사용한다.
  - 1순위: `DIRECT_URL`
  - 2순위: `DATABASE_URL`
- 외부 API 키는 서버 키 우선으로 읽는다.
  - 날씨: `WEATHER_API_KEY` 우선, 없으면 `VITE_WEATHER_API_KEY` fallback
- 캐시는 Redis 우선, 미연결 시 memory fallback으로 동작한다.
  - Redis: `REDIS_URL`, `REDIS_CONNECT_TIMEOUT_MS`
  - TTL: `CACHE_DEFAULT_TTL_SECONDS`, `CACHE_TTL_PACKAGES_SECONDS`, `CACHE_TTL_EXTERNAL_API_SECONDS`, `CACHE_TTL_WEATHER_CURRENT_SECONDS`, `CACHE_TTL_WEATHER_CITY_SECONDS`

## 4. Supabase 연결 가이드

- development:
  - Supabase 개발 프로젝트 또는 로컬 개발 DB 사용
- staging:
  - Supabase 스테이징 프로젝트 사용
- production:
  - Supabase 운영 프로젝트 사용

권장: 환경별로 프로젝트를 분리하고 DB를 공유하지 않는다.

## 5. 배포 체크

- 배포 전 `NODE_ENV`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` 필수값 존재 확인
- 외부 API 키(`EXCHANGE_API_KEY`, `WEATHER_API_KEY`) 존재 확인
- 캐시 설정(`REDIS_URL`, TTL 계열 변수)과 `GET /api/cache/health` 결과 확인
- 스모크 시드 테스트(`SMOKE_USER_ID`)는 운영에서 비활성 또는 별도 계정으로 제한

## 6. 실행 예시

- development:
  - `NODE_ENV=development`
  - `npm run dev`
- staging/production:
  - `NODE_ENV=staging` 또는 `NODE_ENV=production`
  - `npm start`
