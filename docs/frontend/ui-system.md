# Frontend UI System

## 1. 디자인 방향

TravelFlow는 "여행 계획의 신뢰감 + 설렘"을 동시에 전달하는 UI를 목표로 한다.

- 기본 톤: Sky, Mint, Sand 계열
- 강조 톤: Coral, Amber
- 정보 밀도: 카드 중심의 중간 밀도
- 모션: 의도 있는 전환만 사용

## 2. 디자인 토큰

아래 토큰은 CSS 변수 또는 Tailwind theme 확장으로 관리한다.

```css
:root {
  --color-bg: #f7fbff;
  --color-surface: #ffffff;
  --color-text: #10243e;
  --color-muted: #5f738c;
  --color-primary: #0f8ec7;
  --color-primary-strong: #0b6fa0;
  --color-accent: #ff8a4c;
  --color-success: #1f9d67;
  --color-warning: #f2a93b;
  --color-danger: #e25353;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;

  --shadow-sm: 0 4px 14px rgba(16, 36, 62, 0.08);
  --shadow-md: 0 14px 28px rgba(16, 36, 62, 0.12);
}
```

## 3. 타이포그래피

- 제목: 600~700 weight, line-height 1.2
- 본문: 400~500 weight, line-height 1.5
- 캡션: 400 weight, 명도 대비 4.5:1 이상

권장 폰트 페어링 예시:

- Heading: `Sora`
- Body: `Pretendard`

## 4. 레이아웃/반응형

- Breakpoint
  - Mobile: 0~767
  - Tablet: 768~1279
  - Desktop: 1280+
- 컨테이너 최대폭
  - 콘텐츠 페이지: 1200px
  - 폼 페이지: 960px
- 카드 그리드
  - 1열 -> 2열 -> 3열 순 확장

## 5. 컴포넌트 상태 규칙

모든 데이터 컴포넌트는 아래 상태를 동일 패턴으로 제공한다.

- loading: skeleton 또는 spinner
- empty: 안내 문구 + 이동 CTA
- error: 재시도 버튼 + 문제 설명

## 6. 모션 가이드

- 첫 진입: 180~260ms fade + y축 8~16px 이동
- 리스트: 30~60ms stagger
- 경고/오류: 과한 흔들림 대신 색 대비로 표현
- 모션은 정보 전달 목적일 때만 사용한다.

## 7. 접근성 기준

- 키보드 포커스 ring 명확히 표시
- 클릭 타겟 최소 40x40
- 이미지 대체 텍스트 제공
- 색만으로 상태를 구분하지 않는다.

## 8. 이미지/아이콘 사용

- `assets/images`는 페이지 분위기용 대형 비주얼에 사용
- `assets/icons`는 기능 의미 전달 우선
- 장식용 이미지는 lazy 로딩 적용
- 인물/리뷰 프로필은 원형 크롭 일관 유지
