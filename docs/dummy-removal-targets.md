# Dummy Removal Targets

목적: 더미/플레이스홀더 데이터 제거 대상을 추적하고 실데이터 전환 상태를 기록한다.

## 완료

- client/src/components/Profiles/myBookings/History.jsx
  - 더미 예약 리스트 제거
  - /api/bookings 실데이터 연동 완료
- client/src/components/Profiles/myBookings/Cancel.jsx
  - 더미 취소/환불 리스트 제거
  - /api/bookings?status=cancelled 실데이터 연동 완료
- client/src/components/Profiles/myBookings/BookingDetail.jsx
  - 더미 상세 데이터 제거
  - /api/bookings/:id 실데이터 연동 완료
- client/src/components/Booking/BookingLayout.jsx
  - 콘솔 기반 더미 예약 처리 제거
  - /api/bookings/catalog + /api/bookings 생성 연동 완료
- client/src/components/Profiles/myBookings/Review.jsx
  - 더미 후기 가능 목록 제거
  - /api/review/reviewable 실데이터 연동 완료
- client/src/components/Home/Packages.jsx
  - 탭별 placeholder 문구 제거
  - /api/packages 실데이터 카드 표시 전환 완료
- server/routes/packages.js
  - JSON 파일 직접 조회 제거
  - Prisma `package` 테이블 기반 조회로 전환 완료

## 검토 필요

- server/data/packages.json
  - 초기 이관용 원본으로 유지
  - 운영 데이터 소스는 Prisma package 테이블로 전환 완료
