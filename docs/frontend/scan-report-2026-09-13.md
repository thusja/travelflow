# Frontend Scan Report (2026-09-13)

## 범위

- 대상: `client/src` 전체
- 방법: 구조/패턴 스캔 + 핵심 파일 점검 + 오류 진단
- 진단 결과: 컴파일/타입 오류는 없음

## 핵심 발견사항 (우선순위)

### P0. 라우팅 구조 리스크

- `App.jsx`에서 라우트 element 내부에 중첩 `Routes`를 직접 사용 중
- React Router v7 기준으로 동작은 가능해도 유지보수성과 경로 일관성이 크게 떨어짐
- 문제 지점
  - `profile`, `myBookings`, `settings` 각각에 별도 `Routes` 중복
- 영향
  - 하위 라우트 확장 시 버그 유입 가능성 증가
  - Outlet 기반 공통 레이아웃 전환이 어려움

### P0. API Base URL 하드코딩 광범위

- `http://localhost:5000/api` 문자열이 17개 파일에 분산
- `utils/httpClient.js`의 베이스 URL과 각 컴포넌트/유틸의 fetch가 분리 운영됨
- 영향
  - 환경 전환(개발/스테이징/운영) 시 수정 비용 큼
  - 실수로 일부 API만 다른 서버를 바라보는 불일치 위험

### P1. 인증/내비게이션 UX 일관성 문제

- `LoginPage.jsx`에서 `window.location.href` 및 `<a href="/SignUp">` 사용
- SPA 내 라우터 이동(`useNavigate`, `Link`) 대신 전체 리로드가 발생
- `/SignUp` 대소문자 경로가 선언 라우트 `/signup`과 불일치
- 영향
  - 로그인 후 UX 저하(전체 새로고침)
  - 환경/호스팅에 따라 경로 mismatch 가능성

### P1. 데이터 계층 혼재

- 일부 페이지는 TanStack Query 사용, 일부는 수동 `fetch + useState + alert`
- 특히 `Profiles/myBookings/Points.jsx`는 query/mutation 패턴 미적용
- 영향
  - 로딩/에러 처리 일관성 부족
  - invalidate 규칙 재사용 어려움

### P2. 공통 API 래퍼/토큰 주입 일관성 부족

- `httpClient` 인터셉터가 있지만 호출 계층이 통일되지 않음
- 여러 컴포넌트에서 Authorization 헤더를 직접 조립
- 영향
  - 보안/세션 정책 변경 시 수정 범위 확대

## 권장 실행 순서 (빠른 개선안)

1. P0-1: API URL 상수화 + 공통 호출 함수로 1차 통합
2. P0-2: `App.jsx` 하위 보호 라우트를 Outlet 기반으로 재구성
3. P1-1: 로그인/회원가입 이동을 Router 네비게이션으로 통일
4. P1-2: `Points.jsx`를 Query/Mutation 기반으로 전환
5. P2-1: fetch 직접 호출 잔여분을 단계적으로 `utils/api` 또는 feature API로 이관

## 파일 근거

- 라우팅 중첩: `client/src/App.jsx`
- 베이스 URL 하드코딩: `client/src/components/**`, `client/src/utils/api.js`, `client/src/utils/httpClient.js`
- 로그인 이동 패턴: `client/src/pages/LoginPage.jsx`
- 수동 데이터 처리 대표: `client/src/components/Profiles/myBookings/Points.jsx`

## 진행 현황 업데이트 (2026-09-13)

완료:

- P0-1 완료: 클라이언트 API 호출의 하드코딩 베이스 URL을 `/api` 상대 경로로 통일
- P0-2 완료: `App.jsx` 보호 라우트를 Outlet 기반 중첩 라우팅으로 재구성
- P1-1 완료: 로그인/회원가입 이동을 `useNavigate`/`Link` 기반으로 통일
- P1-2 완료: `Points.jsx`를 Query/Mutation 패턴으로 전환
- 추가 완료: `Review.jsx`, `ReviewForm.jsx`, `Logs.jsx`, `ProfileEdit.jsx`, `Withdraw.jsx`, `Notifications.jsx`, `LoginForm.jsx`, `SignUpForm.jsx`도 mutation/query 패턴으로 확장
- 추가 완료: `AuthContext` 초기 복원 시 `/api/users/me` 동기화로 세션 유효성 검증

잔여:

- 컴포넌트 계층의 fetch 직접 호출 제거 완료
- 공통 알림 UX를 토스트 컴포넌트 기반으로 통일 완료
- 내부 인프라 fetch는 `utils/request.js`, `utils/httpClient.js`에만 유지
