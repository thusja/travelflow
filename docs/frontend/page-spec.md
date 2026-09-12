# Frontend Page Spec

## 1. Public Routes

### /

- 목적: 랜딩, 서비스 가치 전달, 패키지 탐색 진입
- 주요 블록: Hero, Service, ServiceStats, Packages, BookingSteps, Reviews, Subscription
- 데이터 의존: 패키지 목록, 후기 요약

### /booking

- 목적: 예약 생성
- 주요 상태: 일정, 인원, 유효성 검증, 제출 로딩
- 데이터 의존: 예약 가능 옵션, 패키지 기본 정보

### /package

- 목적: 패키지 탐색 및 상세 확인
- 주요 상태: 필터, 정렬, 페이지네이션, 상세 선택
- 데이터 의존: 패키지 목록/상세

### /planner

- 목적: 여행 계획 저장/조회
- 주요 상태: 목적지, 일정, 메모, 최근 계획 목록
- 데이터 의존: planner 목록/등록/수정/삭제

### /suggest

- 목적: 여행 제안 제출/관리
- 주요 상태: 제안 입력, 상태 필터, 정렬, 최근 목록
- 데이터 의존: suggestions 목록/등록/상태변경

### /util

- 목적: 여행 보조 도구 제공
- 하위 기능: 환율, 날씨, 보험 가이드
- 데이터 의존: 환율/날씨 API

### /about

- 목적: 회사 정보와 고객 지원 안내
- 주요 상태: 섹션 탭 전환

### /login, /signup

- 목적: 인증 진입
- 주요 상태: 입력 검증, 제출 상태, 에러 피드백

## 2. Private Routes

### /profile/*

- 목적: 사용자 계정 정보 관리
- 하위 화면: info, edit, password, logs, withdraw
- 공통 요구: 인증 필수, 저장 성공 피드백

### /myBookings/*

- 목적: 사용자 예약 라이프사이클 관리
- 하위 화면: history, detail/:bookingId, cancel, review, review/:bookingId, points
- 공통 요구: 예약 상태 기반 액션 가드

### /settings/*

- 목적: 앱 사용성 설정
- 하위 화면: app, notifications
- 공통 요구: 저장 즉시 반영 + 영속화

## 3. 공통 품질 기준

- 모든 페이지에 loading/empty/error 대응
- 폼 제출 중 중복 클릭 방지
- 인증 만료 상황에서 일관된 리다이렉트 UX 제공
- 모바일에서도 핵심 액션 버튼이 첫 화면 내에 보이도록 구성
