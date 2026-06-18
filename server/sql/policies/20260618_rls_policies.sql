begin;

-- Core profile and domain tables
alter table if exists users enable row level security;
alter table if exists bookings enable row level security;
alter table if exists reviews enable row level security;
alter table if exists point_histories enable row level security;
alter table if exists user_coupons enable row level security;
alter table if exists refresh_tokens enable row level security;
alter table if exists idempotency_requests enable row level security;
alter table if exists login_logs enable row level security;
alter table if exists withdrawal_logs enable row level security;
alter table if exists packages enable row level security;
alter table if exists coupons enable row level security;

-- Users: only the owner can read/update their profile.
drop policy if exists users_select_own on users;
create policy users_select_own on users
  for select to authenticated
  using (id = auth.uid());

drop policy if exists users_update_own on users;
create policy users_update_own on users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Bookings: each user can only access their own rows.
drop policy if exists bookings_select_own on bookings;
create policy bookings_select_own on bookings
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists bookings_insert_own on bookings;
create policy bookings_insert_own on bookings
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists bookings_update_own on bookings;
create policy bookings_update_own on bookings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists bookings_delete_own on bookings;
create policy bookings_delete_own on bookings
  for delete to authenticated
  using (user_id = auth.uid());

-- Reviews: public read, owner write.
drop policy if exists reviews_select_all on reviews;
create policy reviews_select_all on reviews
  for select to anon, authenticated
  using (true);

drop policy if exists reviews_insert_own on reviews;
create policy reviews_insert_own on reviews
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists reviews_update_own on reviews;
create policy reviews_update_own on reviews
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists reviews_delete_own on reviews;
create policy reviews_delete_own on reviews
  for delete to authenticated
  using (user_id = auth.uid());

-- User scoped history/token tables.
drop policy if exists point_histories_select_own on point_histories;
create policy point_histories_select_own on point_histories
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists user_coupons_select_own on user_coupons;
create policy user_coupons_select_own on user_coupons
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists user_coupons_update_own on user_coupons;
create policy user_coupons_update_own on user_coupons
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists refresh_tokens_select_own on refresh_tokens;
create policy refresh_tokens_select_own on refresh_tokens
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists refresh_tokens_insert_own on refresh_tokens;
create policy refresh_tokens_insert_own on refresh_tokens
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists refresh_tokens_update_own on refresh_tokens;
create policy refresh_tokens_update_own on refresh_tokens
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists idempotency_requests_select_own on idempotency_requests;
create policy idempotency_requests_select_own on idempotency_requests
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists idempotency_requests_insert_own on idempotency_requests;
create policy idempotency_requests_insert_own on idempotency_requests
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists idempotency_requests_update_own on idempotency_requests;
create policy idempotency_requests_update_own on idempotency_requests
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists login_logs_select_own on login_logs;
create policy login_logs_select_own on login_logs
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists withdrawal_logs_select_own on withdrawal_logs;
create policy withdrawal_logs_select_own on withdrawal_logs
  for select to authenticated
  using (user_id = auth.uid());

-- Catalog tables are public read.
drop policy if exists packages_select_all on packages;
create policy packages_select_all on packages
  for select to anon, authenticated
  using (true);

drop policy if exists coupons_select_all on coupons;
create policy coupons_select_all on coupons
  for select to anon, authenticated
  using (true);

commit;
