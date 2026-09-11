import crypto from "crypto";
import prisma from "../db/index.js";
import { createErrorBody, ERROR_CODES } from "../utils/apiResponse.js";
import { invalidateCacheByPrefixes } from "../utils/cacheStore.js";
import { throwServiceError } from "./serviceError.js";

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
        return finalize(
          409,
          createErrorBody({
            code: ERROR_CODES.CONFLICT_DUPLICATE,
            message: "멱등성 처리 중 충돌이 발생했습니다. 다시 시도해주세요.",
          }),
          "failed",
        );
      }

      if (existing.requestHash !== requestHash) {
        return finalize(
          409,
          createErrorBody({
            code: ERROR_CODES.CONFLICT_DUPLICATE,
            message: "동일한 Idempotency-Key로 다른 요청 본문을 보낼 수 없습니다.",
          }),
          "failed",
        );
      }

      if (
        (existing.state === "completed" || existing.state === "failed") &&
        existing.responseBody
      ) {
        if ((existing.statusCode || 200) >= 400) {
          return finalize(existing.statusCode || 200, existing.responseBody, existing.state);
        }
        return existing.responseBody;
      }

      return finalize(
        409,
        createErrorBody({
          code: ERROR_CODES.CONFLICT_DUPLICATE,
          message: "동일 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.",
        }),
        "failed",
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

  await invalidateCacheByPrefixes(["catalog:packages:"]);

  const response = { message: "쿠폰이 등록되었습니다." };
  if (idempotencyRecord) {
    await prisma.idempotencyRequest.update({
      where: { id: idempotencyRecord.id },
      data: {
        state: "completed",
        statusCode: 200,
        responseBody: response,
      },
    });
  }

  return response;
};
