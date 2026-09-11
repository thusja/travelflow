import { sendError } from "../utils/apiResponse.js";
import {
  getPointAndCoupons,
  registerCoupon,
} from "../services/pointAndCouponService.js";
import { toErrorPayload } from "../services/serviceError.js";

export const getPointAndCouponsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getPointAndCoupons({ userId });
    return res.json(data);
  } catch (err) {
    console.error("포인트/쿠폰 불러오기 오류:", err);
    return sendError(res, toErrorPayload(err));
  }
};

export const registerCouponHandler = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const idempotencyKey = req.headers["idempotency-key"];

    const body = await registerCoupon({
      userId,
      code,
      idempotencyKey,
    });

    return res.status(200).json(body);
  } catch (err) {
    console.error("쿠폰 등록 오류:", err);
    return sendError(res, toErrorPayload(err));
  }
};
