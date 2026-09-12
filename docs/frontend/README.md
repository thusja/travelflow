# Frontend Docs Hub

이 폴더는 TravelFlow 프론트엔드 작업 전용 기준 문서 모음입니다.
기존 `docs/`의 전체 아키텍처 문서에서 프론트 관점만 분리해, 구현자가 빠르게 참고할 수 있도록 정리했습니다.

## 문서 목록

- `architecture.md`: 프론트 구조 원칙, 폴더/레이어 책임, 데이터 흐름
- `ui-system.md`: 디자인 토큰, 반응형 기준, 컴포넌트 스타일 가이드
- `api-integration.md`: API 호출 규칙, Query key, 무효화, 에러 UX
- `page-spec.md`: 라우트별 목적, 주요 상태, API 의존성
- `implementation-checklist.md`: 프론트 구현/검증 체크리스트
- `scan-report-2026-09-13.md`: 현재 프론트 코드 스캔 결과와 우선 수정 항목

## 추천 사용 순서

1. `architecture.md`로 구조 원칙 확인
2. `page-spec.md`로 작업 대상 페이지 범위 확인
3. `api-integration.md`로 데이터 연결 규칙 확인
4. `ui-system.md`로 UI 일관성 맞춤
5. `implementation-checklist.md`로 PR 전 검증

## 범위

- 포함: React/Vite 클라이언트 코드(`client/src`) 기준
- 제외: 서버/DB 마이그레이션 상세 정책(기존 `docs/` 문서 참조)

## 참조 문서

- 상위 전체 워크플로우: `../workflow.md`
- 상태 구조 기준: `../state-structure.md`
- Query 무효화 기준: `../query-invalidation-matrix.md`
- 화면 흐름 기준: `../wireframe.md`
