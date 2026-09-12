import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  getPointAndCoupons,
  registerCoupon,
} from "../services/pointAndCouponService.js";

export const getPointAndCouponsHandler = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const data = await getPointAndCoupons({ userId });
  return res.json(data);
}, "포인트/쿠폰 불러오기 오류:");

export const registerCouponHandler = withErrorHandling(async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;
  const idempotencyKey = req.headers["idempotency-key"];

  const body = await registerCoupon({
    userId,
    code,
    idempotencyKey,
  });

  return res.status(200).json(body);
}, "쿠폰 등록 오류:");
