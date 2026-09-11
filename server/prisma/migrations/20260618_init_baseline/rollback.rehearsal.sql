-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."bookings" DROP CONSTRAINT "bookings_package_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."idempotency_requests" DROP CONSTRAINT "idempotency_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."login_logs" DROP CONSTRAINT "login_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."point_histories" DROP CONSTRAINT "point_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_replaced_by_token_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."reviews" DROP CONSTRAINT "reviews_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."user_coupons" DROP CONSTRAINT "user_coupons_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."user_coupons" DROP CONSTRAINT "user_coupons_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rehearsal_20260618"."withdrawal_logs" DROP CONSTRAINT "withdrawal_logs_user_id_fkey";

-- DropTable
DROP TABLE "rehearsal_20260618"."bookings";

-- DropTable
DROP TABLE "rehearsal_20260618"."coupons";

-- DropTable
DROP TABLE "rehearsal_20260618"."idempotency_requests";

-- DropTable
DROP TABLE "rehearsal_20260618"."job_runs";

-- DropTable
DROP TABLE "rehearsal_20260618"."login_logs";

-- DropTable
DROP TABLE "rehearsal_20260618"."packages";

-- DropTable
DROP TABLE "rehearsal_20260618"."point_histories";

-- DropTable
DROP TABLE "rehearsal_20260618"."refresh_tokens";

-- DropTable
DROP TABLE "rehearsal_20260618"."reviews";

-- DropTable
DROP TABLE "rehearsal_20260618"."user_coupons";

-- DropTable
DROP TABLE "rehearsal_20260618"."users";

-- DropTable
DROP TABLE "rehearsal_20260618"."withdrawal_logs";
