import express from "express";
import crypto from "crypto";
import db from "../db/index.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// 더미 포인트
const dummyPoints = {
  currentPoint: 12340,
  history: [
    { id: 1, date: "2025-06-01", description: "예약 결제 적립", amount: 1000 },
    { id: 2, date: "2025-06-02", description: "후기 작성 보너스", amount: 300 },
    { id: 3, date: "2025-06-03", description: "예약 취소 차감", amount: -500 },
  ],
};

// 더미 쿠폰
const dummyCoupons = [
  {
    id: 1,
    name: "여름 프로모션 10% 할인",
    status: "사용 가능",
    expire: "2025-07-31",
  },
  {
    id: 2,
    name: "웰컴 쿠폰 5,000원",
    status: "사용 완료",
    expire: "2025-05-10",
  },
  {
    id: 3,
    name: "삼성카드 첫 결제 쿠폰",
    status: "기간 만료",
    expire: "2025-05-24",
  },
];

// 포인트 & 쿠폰 조회
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. 자동 만료 업데이트
    await db.query(
      `UPDATE user_coupons uc
       SET status = '기간 만료'
       FROM coupons c
       WHERE uc.coupon_id = c.id
         AND uc.user_id = ?
         AND uc.status = '사용 가능'
         AND c.expire_at < NOW()`,
      [userId],
    );

    // 2. 업데이트된 쿠폰 목록 불러오기
    const [userCoupons] = await db.query(
      `SELECT
         uc.id AS id,
         c.name,
         uc.status,
         TO_CHAR(c.expire_at, 'YYYY-MM-DD') AS expire
       FROM user_coupons uc
       JOIN coupons c ON uc.coupon_id = c.id
       WHERE uc.user_id = ?`,
      [userId],
    );

    // 3. 더미 쿠폰 포함
    const combinedCoupons = [...dummyCoupons, ...userCoupons];

    res.json({
      point: dummyPoints.currentPoint,
      history: dummyPoints.history,
      coupons: combinedCoupons,
    });
  } catch (err) {
    console.error("포인트/쿠폰 불러오기 오류:", err);
    res.status(500).json({ message: "포인트/쿠폰 불러오기 실패" });
  }
});

// 쿠폰 등록
router.post("/register", verifyToken, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  try {
    const [couponRows] = await db.query(
      "SELECT * FROM coupons WHERE code = ? AND expire_at > NOW()",
      [code],
    );

    if (couponRows.length === 0) {
      return res
        .status(400)
        .json({ message: "유효하지 않거나 만료된 쿠폰입니다" });
    }

    const coupon = couponRows[0];

    const [existing] = await db.query(
      "SELECT * FROM user_coupons WHERE user_id = ? AND coupon_id = ?",
      [userId, coupon.id],
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "이미 등록된 쿠폰입니다." });
    }

    const uuid = crypto.randomUUID();
    await db.query(
      "INSERT INTO user_coupons (id, user_id, coupon_id, status, assigned_at) VALUES (?, ?, ?, '사용 가능', NOW())",
      [uuid, userId, coupon.id],
    );

    res.json({ message: "쿠폰이 등록되었습니다." });
  } catch (err) {
    console.error("쿠폰 등록 오류:", err);
    res.status(500).json({ message: "쿠폰 등록 중 오류 발생" });
  }
});

export default router;
