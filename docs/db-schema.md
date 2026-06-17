# TravelFlow DB Schema

## 1) 현재 사용 흔적 기반 테이블 (As-Is, MySQL 추정)

코드 쿼리 기준으로 확인된 테이블/컬럼 추정:

- `users`
  - `id (uuid/string)`
  - `nickname, firstname, lastname, email, password, phone, profileImage`
  - `notifications (json string)`
  - `is_deleted, deleted_at, created_at, updated_at`

- `login_logs`
  - `id`
  - `user_id`
  - `ip`
  - `user_agent`
  - `created_at`

- `withdrawal_logs`
  - `id`
  - `user_id`
  - `reason`
  - `created_at`

- `reviews`
  - `id`
  - `user_id`
  - `booking_id`
  - `rating`
  - `comment`
  - `image_url`
  - `is_deleted`
  - `created_at, updated_at`

- `bookings`
  - `id`
  - `user_id`
  - `package_id`
  - `booking_date`
  - `status` (코드상 `completed` 참조)

- `packages`
  - `id`
  - `title`
  - (현재는 실제로 `packages.json` 사용 중)

- `Coupons`
  - `id, code, name, expire_at`

- `UserCoupons`
  - `id, user_id, coupon_id, status, assigned_at`

## 2) Supabase(PostgreSQL) 전환 설계 (To-Be)

### 2.0 ORM 정책 (Prisma)

- ORM: Prisma 사용
- DB 스키마 기준은 PostgreSQL, Prisma는 모델/마이그레이션/클라이언트 타입 생성 담당
- 원칙: 일반 테이블 변경은 Prisma migration, RLS/정책/함수는 SQL migration으로 분리 관리

## 2.1 네이밍 규칙

- 테이블/컬럼: `snake_case`
- 타임스탬프: `created_at`, `updated_at`
- 소프트 삭제: `deleted_at` (nullable)

### 2.1.1 Prisma 모델 매핑표 (To-Be)

| Prisma model    | DB table                 | 비고               |
| --------------- | ------------------------ | ------------------ |
| `UserProfile`   | `public.user_profiles`   | `auth.users`와 1:1 |
| `LoginLog`      | `public.login_logs`      | 로그인 추적        |
| `WithdrawalLog` | `public.withdrawal_logs` | 탈퇴 사유 저장     |
| `Package`       | `public.packages`        | 상품 데이터        |
| `Booking`       | `public.bookings`        | 예약               |
| `Review`        | `public.reviews`         | 후기               |
| `PointsLedger`  | `public.points_ledger`   | 포인트 원장        |
| `Coupon`        | `public.coupons`         | 쿠폰 마스터        |
| `UserCoupon`    | `public.user_coupons`    | 사용자 쿠폰        |
| `RefreshToken`  | `public.refresh_tokens`  | refresh 회전/폐기  |
| `JobRun`        | `public.job_runs`        | 배치 실행 이력     |

## 2.2 권장 핵심 테이블

```sql
-- extension
create extension if not exists "pgcrypto";

-- users (Supabase auth.users와 1:1 확장 프로필)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  first_name text not null,
  last_name text not null,
  phone text,
  profile_image_url text,
  notifications jsonb not null default '{}'::jsonb,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_profiles_nickname unique (nickname)
);

create table if not exists public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price integer not null check (price >= 0),
  thumbnail_url text,
  details jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'refunding', 'refunded');

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  package_id uuid not null references public.packages(id),
  check_in date not null,
  check_out date not null,
  adults integer not null default 1 check (adults > 0),
  children integer not null default 0 check (children >= 0),
  total_price integer not null check (total_price >= 0),
  status public.booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_booking_dates check (check_out > check_in)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  image_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_reviews_user_booking unique (user_id, booking_id)
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  booking_id uuid references public.bookings(id),
  created_at timestamptz not null default now()
);

create type public.coupon_status as enum ('available', 'used', 'expired');

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  discount_type text not null,
  discount_value numeric(10,2) not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  status public.coupon_status not null default 'available',
  assigned_at timestamptz not null default now(),
  used_at timestamptz,
  unique (user_id, coupon_id)
);

create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  replaced_by_token_id uuid references public.refresh_tokens(id),
  user_agent text,
  ip inet
);

create table if not exists public.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  message text,
  payload jsonb not null default '{}'::jsonb
);
```

## 2.3 인덱스 권장

```sql
create index if not exists idx_login_logs_user_created on public.login_logs(user_id, created_at desc);
create index if not exists idx_bookings_user_created on public.bookings(user_id, created_at desc);
create index if not exists idx_reviews_user_created on public.reviews(user_id, created_at desc);
create index if not exists idx_user_coupons_user_status on public.user_coupons(user_id, status);
create index if not exists idx_points_ledger_user_created on public.points_ledger(user_id, created_at desc);
create index if not exists idx_refresh_tokens_user_expires on public.refresh_tokens(user_id, expires_at desc);
create unique index if not exists uq_refresh_tokens_token_hash on public.refresh_tokens(token_hash);
create index if not exists idx_job_runs_job_started on public.job_runs(job_name, started_at desc);
```

## 2.4 Supabase RLS 기본 정책 권장

```sql
alter table public.user_profiles enable row level security;
alter table public.login_logs enable row level security;
alter table public.withdrawal_logs enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.points_ledger enable row level security;
alter table public.user_coupons enable row level security;

create policy "user can read own profile" on public.user_profiles
for select using (auth.uid() = id);

create policy "user can update own profile" on public.user_profiles
for update using (auth.uid() = id);

create policy "user can read own bookings" on public.bookings
for select using (auth.uid() = user_id);

create policy "user can create own bookings" on public.bookings
for insert with check (auth.uid() = user_id);
```

## 2.5 RLS 정책 매트릭스 (To-Be)

| table            | select                   | insert               | update            | delete             |
| ---------------- | ------------------------ | -------------------- | ----------------- | ------------------ |
| `user_profiles`  | 본인만                   | 시스템/회원가입 시   | 본인만            | soft delete만 허용 |
| `bookings`       | 본인만                   | 본인만               | 본인 + 상태 제약  | 일반 사용자 금지   |
| `reviews`        | 본인 + 공개범위 정책     | 완료 예약 본인만     | 작성자 본인만     | 작성자 soft delete |
| `points_ledger`  | 본인만                   | 시스템만             | 금지(append only) | 금지               |
| `coupons`        | 공개 조회 또는 인증 조회 | 관리자만             | 관리자만          | 관리자만           |
| `user_coupons`   | 본인만                   | 시스템/쿠폰등록 로직 | 사용 처리만       | 금지               |
| `refresh_tokens` | 본인/시스템 제한 조회    | 인증 로직만          | 폐기 처리만       | 만료 정리 작업만   |
| `job_runs`       | 관리자/운영자만          | 워커만               | 워커만            | 운영 정책에 따름   |

## 2.6 데이터 보존 정책 (To-Be)

- `login_logs`: 90일 보관 후 삭제
- `refresh_tokens`: 만료 후 7일 내 정리
- `job_runs`: 30~90일 보관(운영 정책에 맞춤)
- `withdrawal_logs`: 법적/운영 정책에 맞춰 1년 이상 검토
- `points_ledger`: 정산 근거로 장기 보관 권장

## 3) 마이그레이션 체크리스트

- `profileImage -> profile_image_url` 등 camelCase 컬럼명 변환
- `Users/Coupons/UserCoupons` 대소문자 테이블명 정규화
- `notifications`를 text(JSON string)에서 `jsonb`로 전환
- 로컬 업로드 파일을 Supabase Storage 버킷으로 이전
- DB 접속 비밀값을 코드 하드코딩에서 환경변수/시크릿으로 이전
- Prisma `schema.prisma`와 SQL migration(특히 RLS/policy)을 분리 버전 관리
- RefreshToken 저장/폐기 전략(회전, 해시 저장, 만료 삭제 배치) 반영
- Redis 캐시는 DB 영속 데이터가 아니므로 장애 대비 재생성 가능한 키 전략으로 설계
