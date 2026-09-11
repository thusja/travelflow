# Redis Cache Strategy

목적: Redis 기반 캐시를 표준화하고 장애 시 서비스 연속성을 유지한다.

## 연결 정책

- 1순위: REDIS_URL로 Redis 연결
- 폴백: Redis 연결 실패 또는 미설정 시 in-memory 캐시 사용
- 확인 엔드포인트: GET /api/cache/health (mode=redis|memory)

## 캐시 키 규칙

형식: domain:resource:param

예시:

- catalog:packages:filter=all|list=1|page=1|size=12|sort=id:asc
- external:exchangeRates:base=USD|symbols=KRW,JPY
- external:weatherCurrent:lat=37.56|lon=126.97

## TTL 정책

- 패키지 목록: CACHE_TTL_PACKAGES_SECONDS (기본 120초)
- 외부 API 기본: CACHE_TTL_EXTERNAL_API_SECONDS (기본 300초)
- 현재 날씨: CACHE_TTL_WEATHER_CURRENT_SECONDS (기본 180초)
- 도시 날씨: CACHE_TTL_WEATHER_CITY_SECONDS (기본 180초)
- 공통 기본: CACHE_DEFAULT_TTL_SECONDS (기본 60초)

## 현재 적용 범위

- GET /api/packages
- GET /api/exchange-rates
- GET /api/weather/current
- GET /api/weather/by-city

응답 헤더 X-Cache:

- HIT: 캐시 사용
- MISS: 원본 조회 후 캐시에 저장

## Mutation 무효화 규칙

- 예약 생성/취소, 쿠폰 등록 성공 시 catalog:packages: 접두사 키를 즉시 무효화한다.
- 무효화 구현: server/utils/cacheStore.js 의 invalidateCacheByPrefixes 사용
- 규칙 확장: 새 mutation 추가 시 영향 받는 조회 도메인 접두사를 함께 등록한다.

## 블랙리스트/세션 보조키 정책

- 기준 저장소: refresh_tokens 테이블을 세션 진실 원천(Source of Truth)으로 사용한다.
- Redis는 보조 저장소로만 사용하고, 장애 시에도 인증 판단은 DB 기준으로 유지한다.
- 액세스 토큰 블랙리스트는 필요 시 auth:blacklist:{jti} 키로 단기 TTL 운영한다.
- 리프레시 토큰 폐기는 기존 DB revoked_at, replaced_by_token_id 체인을 우선 사용한다.

## 장애 폴백

- Redis 접속 오류 시 자동으로 memory 캐시로 전환한다.
- memory 캐시는 프로세스 재시작 시 초기화된다.
- 운영 환경에서는 Redis 모니터링 알림을 별도로 설정한다.
