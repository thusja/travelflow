-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."bookings" DROP CONSTRAINT "bookings_package_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_booking_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_coupons" DROP CONSTRAINT "user_coupons_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_coupons" DROP CONSTRAINT "user_coupons_coupon_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."login_logs" DROP CONSTRAINT "login_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."withdrawal_logs" DROP CONSTRAINT "withdrawal_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."point_histories" DROP CONSTRAINT "point_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."idempotency_requests" DROP CONSTRAINT "idempotency_requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_replaced_by_token_id_fkey";

-- DropTable
DROP TABLE "public"."users";

-- DropTable
DROP TABLE "public"."packages";

-- DropTable
DROP TABLE "public"."bookings";

-- DropTable
DROP TABLE "public"."reviews";

-- DropTable
DROP TABLE "public"."coupons";

-- DropTable
DROP TABLE "public"."user_coupons";

-- DropTable
DROP TABLE "public"."login_logs";

-- DropTable
DROP TABLE "public"."withdrawal_logs";

-- DropTable
DROP TABLE "public"."point_histories";

-- DropTable
DROP TABLE "public"."idempotency_requests";

-- DropTable
DROP TABLE "public"."refresh_tokens";

-- DropTable
DROP TABLE "public"."job_runs";
