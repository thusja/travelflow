import crypto from "crypto";
import prisma from "../db/index.js";
import { createErrorBody, ERROR_CODES } from "../utils/apiResponse.js";
import { invalidateCacheByPrefixes } from "../utils/cacheStore.js";
import { throwServiceError } from "./serviceError.js";
import {
  createRequestHash,
  finalizeIdempotency,
  startIdempotency,
} from "./idempotencyService.js";
import { requireTrimmedString } from "./validationService.js";

export const getPointAndCoupons = async ({ userId }) => {
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

  const history = pointHistoryRows.map((row) => ({
    id: row.id,
    date: row.createdAt.toISOString().slice(0, 10),
    description: row.description,
    amount: row.amount,
  }));

  return {
    point: pointSummary._sum.amount || 0,
    history,
    coupons: userCoupons,
  };
};

export const registerCoupon = async ({ userId, code, idempotencyKey }) => {
  const normalizedCode = requireTrimmedString(code, "code");
  let idempotencyRecord = null;

  const finalize = async (statusCode, body, state = "completed") => {
    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode,
      body,
      state,
    });

    if (statusCode >= 400) {
      throwServiceError({
        status: statusCode,
        code: body?.error?.code || ERROR_CODES.INTERNAL_ERROR,
        message: body?.message || "요청 처리 중 오류가 발생했습니다.",
        details: body?.error?.details,
      });
    }

    return body;
  };

  if (idempotencyKey && typeof idempotencyKey === "string") {
    const requestHash = createRequestHash({ code: normalizedCode });
    const idemResult = await startIdempotency({
      userId,
      idempotencyKey,
      method: "POST",
      path: "/api/points/register",
      requestHash,
    });

    if (idemResult.replayResponse) {
      if (idemResult.replayResponse.statusCode >= 400) {
        return finalize(
          idemResult.replayResponse.statusCode,
          idemResult.replayResponse.body,
          "failed",
        );
      }
      return idemResult.replayResponse.body;
    }

    idempotencyRecord = idemResult.record;
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: normalizedCode,
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

  await invalidateCacheByPrefixes(["catalog:packages:"]);

  const response = { message: "쿠폰이 등록되었습니다." };
  await finalizeIdempotency({
    record: idempotencyRecord,
    statusCode: 200,
    body: response,
    state: "completed",
  });

  return response;
};
