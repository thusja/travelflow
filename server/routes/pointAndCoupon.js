import express from "express";
import crypto from "crypto";
import prisma from "../db/index.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// 포인트 & 쿠폰 조회
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.userCoupon.updateMany({
      where: {
        userId,
        status: "사용 가능",
        coupon: {
          expireAt: { lt: new Date() },
        },
      },
      data: {
        status: "기간 만료",
      },
    });

    const userCouponsRaw = await prisma.userCoupon.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        coupon: {
          select: {
            name: true,
            expireAt: true,
          },
        },
      },
    });

    const userCoupons = userCouponsRaw.map((row) => ({
      id: row.id,
      name: row.coupon.name,
      status: row.status,
      expire: row.coupon.expireAt.toISOString().slice(0, 10),
    }));

    const pointSummary = await prisma.pointHistory.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const pointHistoryRows = await prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
      },
    });

    const pointHistory = pointHistoryRows.map((row) => ({
      id: row.id,
      date: row.createdAt.toISOString().slice(0, 10),
      description: row.description,
      amount: row.amount,
    }));

    res.json({
      point: pointSummary._sum.amount || 0,
      history: pointHistory,
      coupons: userCoupons,
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
        expireAt: { gt: new Date() },
      },
    });

    if (!coupon) {
      return res
        .status(400)
        .json({ message: "유효하지 않거나 만료된 쿠폰입니다" });
    }

    const existing = await prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId: coupon.id,
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
        userId,
        couponId: coupon.id,
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
