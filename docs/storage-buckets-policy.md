# Storage Bucket and Access Policy Guide

목적: 프로필/리뷰 이미지 저장소를 Supabase Storage로 표준화하고 접근 정책을 명확히 한다.

## 버킷 정의

- `profile-images`: 비공개 버킷 (`public=false`)
- `review-images`: 공개 버킷 (`public=true`)
- 허용 확장자: `jpeg`, `jpg`, `png`, `webp`
- 최대 파일 크기: 5MB

## SQL 파일

- 적용 SQL: `server/sql/storage/20260618_storage_buckets.sql`
- 롤백 SQL: `server/sql/storage/20260618_storage_buckets.rollback.sql`

## 정책 규칙

- 프로필 이미지: `profile-images/{user_id}/...` 경로만 본인 읽기/쓰기/수정/삭제 허용
- 리뷰 이미지: `review-images/{user_id}/...` 경로에 본인 쓰기/수정/삭제 허용, 읽기는 전체 공개

## 실행 명령

```bash
cd server
npm run storage:apply
npm run storage:check
```

롤백(정책만 제거):

```bash
cd server
npm run storage:rollback
```

## 기존 로컬 업로드 경로 매핑

- `/uploads/profile/<filename>` -> `profile-images/<user_id>/<filename>`
- `/uploads/reviews/<filename>` -> `review-images/<user_id>/<filename>`

서버 업로드 로직이 Supabase Storage SDK로 전환될 때 위 규칙을 기본 경로로 사용한다.

## 검증 기록

- 적용 명령: `npm run storage:apply`
- 검증 명령: `npm run storage:check`
- 결과: `bucketCount=2`, `policyCount=8`
- 버킷 상태: `profile-images:false`, `review-images:true`
