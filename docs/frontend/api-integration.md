# Frontend API Integration Guide

## 1. 목적

프론트 API 연동 방식을 통일해 중복 로직과 상태 불일치를 줄인다.

## 2. 기본 원칙

- 모든 네트워크 요청은 `utils/request.js`의 `requestApi` 또는 동일 정책 래퍼를 통해 호출
- 인증 토큰 주입, 401 refresh 재시도, 실패 시 공통 로그아웃 흐름을 유지
- 컴포넌트 내부에서 직접 `fetch`를 남발하지 않는다.

## 3. 응답 처리 규칙

- 성공
  - 비즈니스 데이터만 뷰로 전달
- 실패
  - 상태 코드별 메시지 매핑
  - 가능한 경우 사용자 액션(재시도/이동) 제공

## 4. Query Key 표준

현재 코드와 문서를 기준으로 아래 키를 표준으로 사용한다.

- `['packages', 'list', params]`
- `['bookings', 'list', params]`
- `['reviews', 'reviewable', params]`
- `['points', 'summary']`
- `['coupons', 'list', params]`
- `['users', 'logs', params]`
- `['planner', 'list', params]`
- `['suggestions', 'list', params]`

확장 시 규칙:

- 포맷: `['domain', 'resource', params]`
- params는 stable object 사용
- Date/함수/랜덤값 직접 삽입 금지

## 5. 무효화 규칙(핵심)

- 예약 생성 성공 -> `bookings.list`, `packages.list`
- 예약 취소 성공 -> `bookings.list`, `points.summary`, `coupons.list`
- 후기 작성 성공 -> `reviews.reviewable`, `bookings.list`
- 여행 제안 상태 변경 성공 -> `suggestions.list`
- 플래너 수정/삭제 성공 -> `planner.list`

## 6. 에러 UX 매핑

- 400: 입력값 검증 안내
- 401: refresh 시도 후 실패 시 로그인 유도
- 403: 권한 없음 메시지 + 이전 화면 이동
- 404: 리소스 없음 안내 + 목록 복귀 CTA
- 500: 잠시 후 재시도 안내

## 7. Mutation 구현 체크

- optimistic update가 필요 없으면 invalidate 우선
- invalidate 대상은 최소 단위로 지정
- mutation 성공 토스트와 실패 토스트 문구를 분리

## 8. 코드 패턴 예시

```js
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { apiGet } from '@/utils/api';

export function usePackages(params) {
  return useQuery({
    queryKey: queryKeys.packages.list(params),
    queryFn: () => apiGet('/packages', { params }),
    staleTime: 1000 * 60,
  });
}
```
