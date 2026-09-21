import crypto from "crypto";
import prisma from "../db/index.js";
import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";

export const createRequestHash = (payload) =>
  crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");

export const startIdempotency = async ({
  userId,
  idempotencyKey,
  method,
  path,
  requestHash,
}) => {
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { record: null, replayResponse: null };
  }

  const key = idempotencyKey.trim();
  if (!key) {
    return { record: null, replayResponse: null };
  }

  try {
    const record = await prisma.idempotencyRequest.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        idempotencyKey: key,
        method,
        path,
        requestHash,
      },
    });

    return { record, replayResponse: null };
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
      throwServiceError({
        status: 409,
        code: ERROR_CODES.CONFLICT_DUPLICATE,
        message: "멱등성 처리 중 충돌이 발생했습니다. 다시 시도해주세요.",
      });
    }

    if (existing.requestHash !== requestHash) {
      throwServiceError({
        status: 409,
        code: ERROR_CODES.CONFLICT_DUPLICATE,
        message: "동일한 Idempotency-Key로 다른 요청 본문을 보낼 수 없습니다.",
      });
    }

    if (
      (existing.state === "completed" || existing.state === "failed") &&
      existing.responseBody
    ) {
      return {
        record: null,
        replayResponse: {
          statusCode: existing.statusCode || 200,
          body: existing.responseBody,
        },
      };
    }

    throwServiceError({
      status: 409,
      code: ERROR_CODES.CONFLICT_DUPLICATE,
      message: "동일 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.",
    });
  }
};

export const finalizeIdempotency = async ({ record, statusCode, body, state }) => {
  if (!record) {
    return;
  }

  await prisma.idempotencyRequest
    .update({
      where: { id: record.id },
      data: {
        state,
        statusCode,
        responseBody: body,
      },
    })
    .catch(() => undefined);
};
