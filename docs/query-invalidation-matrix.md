# Query Key Naming and Invalidation Matrix

목적: 7번 항목의 Query key 네이밍과 mutation 후 무효화 규칙을 문서 기준으로 고정한다.

## 키 네이밍 규칙

- 형식: [domain, resource, params]
- params는 stable object 사용
- 랜덤값, Date 객체 원본, 함수 참조는 key에 넣지 않는다.

## 표준 키

- ["auth", "me"]
- ["packages", "list", { page, size, filter, sort }]
- ["bookings", "list", { status, page, size, sort }]
- ["bookings", "detail", bookingId]
- ["reviews", "reviewable", { page, size }]
- ["points", "summary"]
- ["coupons", "list", { status, page, size }]
- ["users", "logs", { period, page, size }]

## 무효화 매트릭스

- 로그인 성공: ["auth", "me"]
- 프로필 수정 성공: ["auth", "me"], ["users", "profile"]
- 예약 생성 성공: ["bookings", "list"], ["packages", "list"]
- 예약 취소 성공: ["bookings", "list"], ["points", "summary"], ["coupons", "list"]
- 후기 작성 성공: ["reviews", "reviewable"], ["bookings", "list"]
- 쿠폰 등록 성공: ["coupons", "list"], ["points", "summary"]
- 알림 설정 변경: ["users", "notifications"], ["auth", "me"]

## 현재 상태

- 현재 클라이언트는 TanStack Query 미도입 상태이며 fetch + 로컬 상태를 사용한다.
- 본 문서를 기준으로 도입 시 queryKey/invalidateQueries를 동일 규칙으로 적용한다.
