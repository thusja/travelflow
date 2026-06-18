import express from "express";
import crypto from "crypto";
import prisma from "../db/index.js";
import { verifyToken } from "../middlewares/auth.js";
import {
  createErrorBody,
  ERROR_CODES,
  sendError,
} from "../utils/apiResponse.js";

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
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "포인트/쿠폰 불러오기 실패",
    });
  }
});

// 쿠폰 등록
router.post("/register", verifyToken, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;
  const idempotencyKey = req.headers["idempotency-key"];

  let idempotencyRecord = null;

  const finalize = async (statusCode, body, state = "completed") => {
    if (idempotencyRecord) {
      await prisma.idempotencyRequest.update({
        where: { id: idempotencyRecord.id },
        data: {
          state,
          statusCode,
          responseBody: body,
        },
      });
    }

    return res.status(statusCode).json(body);
  };

  try {
    if (idempotencyKey && typeof idempotencyKey === "string") {
      const key = idempotencyKey.trim();
      const path = "/api/points/register";
      const method = "POST";
      const requestHash = crypto
        .createHash("sha256")
        .update(JSON.stringify({ code: code ?? null }))
        .digest("hex");

      try {
        idempotencyRecord = await prisma.idempotencyRequest.create({
          data: {
            id: crypto.randomUUID(),
            userId,
            idempotencyKey: key,
            method,
            path,
            requestHash,
          },
        });
      } catch {
        const existing = await prisma.idempotencyRequest.findFirst({
          where: {
            userId,
            idempotencyKey: key,
            method,
            path,
          },
        });

        if (!existing) {
          return res.status(409).json(
            createErrorBody({
              code: ERROR_CODES.CONFLICT_DUPLICATE,
              message: "멱등성 처리 중 충돌이 발생했습니다. 다시 시도해주세요.",
            }),
          );
        }

        if (existing.requestHash !== requestHash) {
          return res.status(409).json(
            createErrorBody({
              code: ERROR_CODES.CONFLICT_DUPLICATE,
              message:
                "동일한 Idempotency-Key로 다른 요청 본문을 보낼 수 없습니다.",
            }),
          );
        }

        if (
          (existing.state === "completed" || existing.state === "failed") &&
          existing.responseBody
        ) {
          return res
            .status(existing.statusCode || 200)
            .json(existing.responseBody);
        }

        return res.status(409).json(
          createErrorBody({
            code: ERROR_CODES.CONFLICT_DUPLICATE,
            message: "동일 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.",
          }),
        );
      }
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        expireAt: { gt: new Date() },
      },
    });

    if (!coupon) {
      return finalize(
        400,
        createErrorBody({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "유효하지 않거나 만료된 쿠폰입니다",
        }),
        "failed",
      );
    }

    const existing = await prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId: coupon.id,
      },
      select: { id: true },
    });

    if (existing) {
      return finalize(
        409,
        createErrorBody({
          code: ERROR_CODES.CONFLICT_DUPLICATE,
          message: "이미 등록된 쿠폰입니다.",
        }),
        "failed",
      );
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

    return finalize(200, { message: "쿠폰이 등록되었습니다." }, "completed");
  } catch (err) {
    console.error("쿠폰 등록 오류:", err);
    if (idempotencyRecord) {
      await prisma.idempotencyRequest
        .update({
          where: { id: idempotencyRecord.id },
          data: {
            state: "failed",
            statusCode: 500,
            responseBody: createErrorBody({
              code: ERROR_CODES.INTERNAL_ERROR,
              message: "쿠폰 등록 중 오류 발생",
            }),
          },
        })
        .catch(() => undefined);
    }

    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "쿠폰 등록 중 오류 발생",
    });
  }
});

export default router;
