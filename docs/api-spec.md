# TravelFlow API Spec

## 1) Base

- Dev Base URL: http://localhost:5000
- Prefix: /api
- Auth Header: Authorization: Bearer <token>

## 2) 공통 규약

### 2.1 성공 응답

- 성공 응답은 엔드포인트별 데이터 구조를 직접 반환한다.
- 예: { message, userId } 또는 { items, meta }.

### 2.2 에러 응답

- 모든 에러 응답은 아래 포맷을 사용한다.

```json
{
  "success": false,
  "message": "요청 처리 중 오류가 발생했습니다.",
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "요청 처리 중 오류가 발생했습니다."
  },
  "meta": {}
}
```

### 2.3 공통 에러 코드

- AUTH_UNAUTHORIZED
- AUTH_FORBIDDEN
- AUTH_REFRESH_INVALID
- VALIDATION_ERROR
- RESOURCE_NOT_FOUND
- CONFLICT_DUPLICATE
- RATE_LIMITED
- INTERNAL_ERROR

### 2.4 목록 조회 규약

- 지원 쿼리: page, size, sort, filter
- page: 1-base, 기본 1
- size: 기본 20, 최대 100
- sort: key:asc 또는 key:desc, 또는 -key
- page/size/sort/filter 중 하나라도 포함되면 응답은 { items, meta } 포맷
- meta: { page, size, total, totalPages }

### 2.5 멱등성 헤더

- 지원 API
  - POST /api/bookings
  - PATCH /api/bookings/:id/cancel
  - POST /api/points/register
- 요청 헤더
  - Idempotency-Key: <unique-string>

## 3) 현재 구현 API

### 3.1 Auth

#### POST /api/auth/signup

- Body: nickname, firstname, lastname, email, password, phone
- Response: { message, userId }

#### POST /api/auth/login

- Body: email, password
- Response: { message, token, accessToken, refreshToken, user }

#### POST /api/auth/reactivate

- Body: email
- Response: { message }

#### POST /api/auth/refresh

- Body: { refreshToken }
- Response: { message, token, accessToken, refreshToken }

#### POST /api/auth/logout

- Body: { refreshToken }
- Response: { message }

#### POST /api/auth/logout-all (auth)

- Response: { message }

### 3.2 Users

#### PUT /api/users/profile (auth, multipart)

- Body(FormData): nickname?, phone?, image?
- Response: { message, user }

#### PUT /api/users/profile-image (auth, multipart)

- Body(FormData): image
- Response: { message, user }

#### POST /api/users/verify-password (auth)

- Body: { password }
- Response: { message }

#### PUT /api/users/password (auth)

- Body: { currentPassword, newPassword }
- Response: { message }

#### GET /api/users/logs (auth)

- Query: page, size, sort(createdAt|ip), filter
- Response: login log 배열 또는 { items, meta }

#### GET /api/users/me (auth)

- Response: user profile

#### DELETE /api/users/me (auth)

- Body: { reason }
- Response: { message }

#### DELETE /api/users (auth)

- 레거시 호환 경로, /api/users/me와 동일 동작

#### PATCH /api/users/notifications (auth)

- Body: { notifications }
- Response: { message }

### 3.3 Packages

#### GET /api/packages

- Query: page, size, sort(id|title|price), filter
- Header: X-Cache(HIT|MISS)
- Response: 패키지 배열 또는 { items, meta }

### 3.4 Bookings

#### GET /api/bookings/catalog

- Response: 패키지 요약 배열(id, title, price)

#### GET /api/bookings (auth)

- Query: page, size, sort(bookingDate|status|createdAt), filter, status
- Response: 예약 배열 또는 { items, meta }

#### GET /api/bookings/:id (auth)

- Response: 예약 상세

#### POST /api/bookings (auth)

- Body: { packageId, bookingDate }
- Optional Header: Idempotency-Key
- Response: { message, booking }

#### PATCH /api/bookings/:id/cancel (auth)

- Body: { reason? }
- Optional Header: Idempotency-Key
- Response: { message, booking }

### 3.5 Reviews

#### POST /api/review (auth, multipart)

- Body(FormData): bookingId, rating, comment, image?
- Response: { message }

#### GET /api/review/reviewable (auth)

- Query: page, size, sort(bookingDate|title), filter
- Response: 리뷰 가능 예약 배열 또는 { items, meta }

#### DELETE /api/review/:id (auth)

- Soft delete
- Response: { message }

### 3.6 Points/Coupons

#### GET /api/points (auth)

- Response: { point, history, coupons }

#### POST /api/points/register (auth)

- Body: { code }
- Optional Header: Idempotency-Key
- Response: { message }

### 3.7 Planner

#### GET /api/planner

- Response: trip plan 배열

#### POST /api/planner

- Body: { destination, travelDate, memo }
- Response: { message, plan }

#### PUT /api/planner/:id

- Body: { destination, travelDate, memo }
- Response: { message, plan }

#### DELETE /api/planner/:id

- Response: { message, deletedId }

### 3.8 Suggestions

#### GET /api/suggestions

- Query: status(all|received|reviewed), sort(latest|oldest)
- Response: suggestion 배열

#### POST /api/suggestions

- Body: { destination, suggestion }
- Response: { message, suggestion }

#### PATCH /api/suggestions/:id/status

- Body: { status }  // received | reviewed
- Response: { message, suggestion }

#### DELETE /api/suggestions/:id

- Response: { message, suggestion }

### 3.9 Utils

#### GET /api/exchange-rates?base=USD&symbols=KRW,JPY

- Header: X-Cache(HIT|MISS)

#### GET /api/weather/current?lat=..&lon=..

- Header: X-Cache(HIT|MISS)

#### GET /api/weather/by-city?city=Seoul

- Header: X-Cache(HIT|MISS)

#### GET /api/cache/health

- Response: { mode }

## 4) 확장 방향

- /api/v1 버저닝 전환, 응답 envelope 통일, 쿠키 기반 refresh 전략은 향후 단계로 유지한다.
- 상세 순서는 docs/expansion-roadmap.md를 기준으로 진행한다.
