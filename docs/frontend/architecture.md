# Frontend Architecture Guide

## 1. 목표

- 프론트 코드의 책임 경계를 명확히 분리한다.
- 서버 상태와 UI 상태를 분리해 유지보수성을 높인다.
- 페이지 단위 구현 대신 기능 단위 확장을 가능하게 한다.

## 2. 현재 코드 기준 레이어

- `pages/`: 라우트 진입점, 페이지 레이아웃 조합
- `components/`: UI 구성 단위
- `contexts/`: 인증 등 전역 상태
- `utils/`: API 클라이언트, 공용 유틸
- `hooks/`: 재사용 훅

## 3. 책임 분리 원칙

- 페이지(`pages`)
  - 라우트 진입만 담당
  - 데이터 가공/비즈니스 로직 최소화
- 컴포넌트(`components`)
  - 표시/입력 처리 중심
  - 직접 fetch 대신 훅 또는 api 유틸 사용
- 컨텍스트(`contexts`)
  - 인증 세션, 전역 이벤트 처리
- 유틸(`utils`)
  - 네트워크 공통 정책(토큰, 401 재시도, 에러 정규화)

## 4. 데이터 흐름 표준

1. 화면 입력 발생
2. 커스텀 훅 또는 Query hook 호출
3. `utils/httpClient` 기반 API 요청
4. 응답을 Query 캐시에 저장
5. 컴포넌트는 캐시 상태를 구독해 렌더

## 5. 라우팅 구조 기준

- 공개 페이지: `/`, `/package`, `/booking`, `/planner`, `/suggest`, `/util`, `/about`, `/login`, `/signup`
- 보호 페이지: `/profile/*`, `/myBookings/*`, `/settings/*`
- 보호 페이지는 `PrivateRoute`를 반드시 통과한다.

## 6. 폴더 확장 권장안

기존 구조를 유지하되 신규 기능은 아래 패턴을 우선 권장한다.

```text
src/
  features/
    <domain>/
      api.js
      hooks.js
      mapper.js
      components/
  shared/
    ui/
    lib/
```

## 7. 구현 규칙

- Query key는 `domain/resource/params` 규칙을 따른다.
- 서버 상태는 Query로 관리하고 로컬 state 중복 저장을 피한다.
- 더미 데이터 사용 시 파일 상단에 TODO와 제거 기준을 명시한다.
- 비동기 상태는 `loading/empty/error` 3종 UI를 반드시 처리한다.

## 8. 성능 기준

- 페이지 단위 `lazy` 로딩 유지
- 리스트 렌더 시 key 안정성 보장
- 비싼 계산은 `useMemo`/`useCallback`로 제한적 적용
- 이미지 에셋은 용량 최적화 후 사용
