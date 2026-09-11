begin;

drop policy if exists users_select_own on users;
drop policy if exists users_update_own on users;
drop policy if exists bookings_select_own on bookings;
drop policy if exists bookings_insert_own on bookings;
drop policy if exists bookings_update_own on bookings;
drop policy if exists bookings_delete_own on bookings;
drop policy if exists reviews_select_all on reviews;
drop policy if exists reviews_insert_own on reviews;
drop policy if exists reviews_update_own on reviews;
drop policy if exists reviews_delete_own on reviews;
drop policy if exists point_histories_select_own on point_histories;
drop policy if exists user_coupons_select_own on user_coupons;
drop policy if exists user_coupons_update_own on user_coupons;
drop policy if exists refresh_tokens_select_own on refresh_tokens;
drop policy if exists refresh_tokens_insert_own on refresh_tokens;
drop policy if exists refresh_tokens_update_own on refresh_tokens;
drop policy if exists idempotency_requests_select_own on idempotency_requests;
drop policy if exists idempotency_requests_insert_own on idempotency_requests;
drop policy if exists idempotency_requests_update_own on idempotency_requests;
drop policy if exists login_logs_select_own on login_logs;
drop policy if exists withdrawal_logs_select_own on withdrawal_logs;
drop policy if exists packages_select_all on packages;
drop policy if exists coupons_select_all on coupons;

alter table if exists users disable row level security;
alter table if exists bookings disable row level security;
alter table if exists reviews disable row level security;
alter table if exists point_histories disable row level security;
alter table if exists user_coupons disable row level security;
alter table if exists refresh_tokens disable row level security;
alter table if exists idempotency_requests disable row level security;
alter table if exists login_logs disable row level security;
alter table if exists withdrawal_logs disable row level security;
alter table if exists packages disable row level security;
alter table if exists coupons disable row level security;

commit;
