# TravelFlow API Spec

## 1) Base

- Dev Base URL: `http://localhost:5000`
- Prefix: `/api`
- Auth: `Authorization: Bearer <token>`

### 1.1 JWT 정책(To-Be)

- AccessToken: 짧은 만료(권장 15분), API 인증 헤더에 포함
- RefreshToken: 긴 만료(권장 14일), 재발급 전용
- RefreshToken 전달: HttpOnly Cookie 권장
- 재발급: Access 만료 시 `POST /api/v1/auth/refresh` 호출
- 로그아웃: RefreshToken 폐기 + Redis 블랙리스트 반영

## 2) 현재 구현 API (As-Is)

## 2.1 Auth

### POST `/api/auth/signup`

- Body: `nickname, firstname, lastname, email, password, phone`
- Response: `{ message, userId }`

### POST `/api/auth/login`

- Body: `email, password`
- Response: `{ message, token, user }`

### POST `/api/auth/reactivate`

- Body: `email`
- Response: `{ message }`

## 2.2 Users

### PUT `/api/users/profile` (auth, multipart)

- Body(FormData): `nickname, phone, image?`
- Response: `{ message, user }`

### PUT `/api/users/profile-image` (auth, multipart)

- Body(FormData): `image`
- Response: `{ message, user }`

### POST `/api/users/verify-password` (auth)

- Body: `{ password }`

### PUT `/api/users/password` (auth)

- Body: `{ currentPassword, newPassword }`

### GET `/api/users/logs` (auth)

- Response: `login_logs[]`

### GET `/api/users/me` (auth)

- Response: user profile

### DELETE `/api/users` (auth)

- Body: `{ reason }`
- Note: 현재 프론트는 `DELETE /api/users/me` 호출 중 (경로 불일치)

### PATCH `/api/users/notifications` (auth)

- Body: `{ notifications }`

## 2.3 Packages

### GET `/api/packages`

- Response: `packages.json` 배열

## 2.4 Reviews

### POST `/api/review` (auth, multipart)

- Body(FormData): `bookingId, rating, comment, image?`
- Response: `{ message }`
- Note: 현재 프론트는 `content` 필드를 전송 중 (필드 불일치)

### GET `/api/review/reviewable` (auth)

- Response: 리뷰 가능 예약 목록

### DELETE `/api/review/:id` (auth)

- Soft delete

## 2.5 Point/Coupon

### GET `/api/points` (auth)

- Response: `{ point, history, coupons }`
- Note: 더미 + DB 혼합 데이터

### POST `/api/points/register` (auth)

- Body: `{ code }`

## 2.6 Utils

### GET `/api/exchange-rates?base=USD&symbols=KRW,JPY`

### GET `/api/weather/current?lat=..&lon=..`

### GET `/api/weather/by-city?city=Seoul`

## 3) To-Be API 설계 (Supabase 기준 권장)

## 3.1 버전 정책

- Prefix: `/api/v1`
- 모든 응답 envelope 통일:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

## 3.2 리소스 설계

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `POST /api/v1/auth/reactivate`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/me/password`
- `PATCH /api/v1/users/me/notifications`
- `DELETE /api/v1/users/me`
- `GET /api/v1/packages`
- `GET /api/v1/bookings`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/:id`
- `POST /api/v1/bookings/:id/cancel`
- `GET /api/v1/reviews/reviewable`
- `POST /api/v1/reviews`
- `DELETE /api/v1/reviews/:id`
- `GET /api/v1/points`
- `GET /api/v1/coupons`
- `POST /api/v1/coupons/register`

## 3.3 Auth 응답 규약(To-Be)

### POST `/api/v1/auth/login`

- Body: `{ email, password }`
- Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "traveler"
    }
  },
  "error": null,
  "meta": {}
}
```

- Note: RefreshToken은 JSON 응답 대신 HttpOnly Cookie로 설정 권장

### POST `/api/v1/auth/refresh`

- Body: 없음(쿠키 기반) 또는 `{ refreshToken }`
- Response: 새 `accessToken` 발급

### POST `/api/v1/auth/logout`

- Body: 없음
- 동작: 현재 세션 RefreshToken 폐기 + 필요 시 AccessToken jti 블랙리스트 처리

### POST `/api/v1/auth/logout-all`

- Body: 없음
- 동작: 해당 사용자 모든 RefreshToken 폐기

## 3.4 캐시/스케줄 연동 정책(To-Be)

- Redis 캐시 키 예시
  - `packages:list:{page}:{filter}`
  - `coupons:user:{userId}`
- 캐시 TTL 권장
  - 패키지 목록: 5분
  - 환율/날씨 중계: 1~5분
- 스케줄 작업
  - 쿠폰 만료 상태 업데이트(매시간)
  - 여행 하루 전 리마인더 큐 enqueue(매일)
  - 포인트 만료 처리(매일)

## 3.5 검증/에러 규칙

- 필수 입력 검증 실패: `400`
- 인증 없음: `401`
- 권한 없음: `403`
- 리소스 없음: `404`
- 중복: `409`
- 서버 오류: `500`

## 3.6 공통 에러 코드 카탈로그 (To-Be)

| code                   | http status | 의미                   | 클라이언트 처리                         |
| ---------------------- | ----------- | ---------------------- | --------------------------------------- |
| `AUTH_UNAUTHORIZED`    | 401         | AccessToken 누락/만료  | refresh 1회 시도 후 실패 시 로그인 이동 |
| `AUTH_FORBIDDEN`       | 403         | 권한 없음              | 권한 안내 후 이전 화면 이동             |
| `AUTH_REFRESH_INVALID` | 401         | RefreshToken 무효/만료 | 세션 종료 처리                          |
| `VALIDATION_ERROR`     | 400         | 입력 검증 실패         | 필드 에러 표시                          |
| `RESOURCE_NOT_FOUND`   | 404         | 리소스 없음            | 목록 복귀 CTA 표시                      |
| `CONFLICT_DUPLICATE`   | 409         | 중복 데이터            | 중복 안내 메시지 표시                   |
| `RATE_LIMITED`         | 429         | 요청 과다              | 재시도 대기 시간 안내                   |
| `INTERNAL_ERROR`       | 500         | 서버 오류              | 재시도 버튼/문의 안내                   |

## 3.7 목록 조회 쿼리 규약 (To-Be)

- 공통 쿼리 파라미터
  - `page`: 1-base
  - `size`: 기본 20, 최대 100
  - `sort`: 예 `created_at:desc`
  - `filter`: 예 `status:eq:completed`
  - `q`: 전체 텍스트 검색어
- 응답 `meta` 규약

```json
{
  "meta": {
    "page": 1,
    "size": 20,
    "total": 128,
    "sort": "created_at:desc"
  }
}
```

## 3.8 멱등성 규약 (To-Be)

- 대상 API
  - 예약 생성: `POST /api/v1/bookings`
  - 예약 취소: `POST /api/v1/bookings/:id/cancel`
  - 쿠폰 등록: `POST /api/v1/coupons/register`
- 요청 헤더
  - `Idempotency-Key: <uuid>`
- 서버 처리
  - 동일 키로 들어온 중복 요청은 최초 성공 응답 재사용
  - 키 TTL 권장: 24시간
  - 충돌 시 `409 CONFLICT_DUPLICATE` 반환

## 4) 즉시 수정 권장 항목

- 프론트 리뷰 작성 필드 `content -> comment` 통일
- 회원탈퇴 엔드포인트 경로 통일(`DELETE /users/me` 권장)
- 로그인 요청 중복 제거(한 계층에서만 API 호출)
- 더미 데이터 반환 API는 별도 mock 모드로 분리
