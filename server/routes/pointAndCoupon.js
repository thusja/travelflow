import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
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
  { id: 1, name: "여름 프로모션 10% 할인", status: "사용 가능", expire: "2025-07-31" },
  { id: 2, name: "웰컴 쿠폰 5,000원", status: "사용 완료", expire: "2025-05-10" },
  { id: 3, name: "삼성카드 첫 결제 쿠폰", status: "기간 만료", expire: "2025-05-24" },
];

// 포인트 & 쿠폰 조회
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. 자동 만료 업데이트
    await prisma.userCoupon.updateMany({
      where: {
        user_id: userId,
        status: "사용 가능",
        coupon: {
          expire_at: {
            lt: new Date(),
          },
        },
      },
      data: {
        status: "기간 만료",
      },
    });

    // 2. 업데이트된 쿠폰 목록 불러오기
    const userCoupons = await prisma.userCoupon.findMany({
      where: { user_id: userId },
      include: {
        coupon: {
          select: {
            name: true,
            expire_at: true,
          },
        },
      },
    });

    const normalizedCoupons = userCoupons.map((coupon) => ({
      id: coupon.id,
      name: coupon.coupon?.name,
      status: coupon.status,
      expire: coupon.coupon?.expire_at?.toISOString().slice(0, 10),
    }));

    // 3. 더미 쿠폰 포함
    const combinedCoupons = [...dummyCoupons, ...normalizedCoupons];

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
    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        expire_at: {
          gt: new Date(),
        },
      },
    });

    if (!coupon) {
      return res.status(400).json({ message: "유효하지 않거나 만료된 쿠폰입니다" });
    }

    const existing = await prisma.userCoupon.findFirst({
      where: {
        user_id: userId,
        coupon_id: coupon.id,
      },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({ message: "이미 등록된 쿠폰입니다." });
    }

    const uuid = crypto.randomUUID();
    await prisma.userCoupon.create({
      data: {
        id: uuid,
        user_id: userId,
        coupon_id: coupon.id,
        status: "사용 가능",
      },
    });

    res.json({ message: "쿠폰이 등록되었습니다." });
  } catch (err) {
    console.error("쿠폰 등록 오류:", err);
    res.status(500).json({ message: "쿠폰 등록 중 오류 발생" });
  }
});

export default router;
