import crypto from "crypto";
import prisma from "../db/index.js";
import { createErrorBody, ERROR_CODES } from "../utils/apiResponse.js";
import { invalidateCacheByPrefixes } from "../utils/cacheStore.js";
import { ServiceError, throwServiceError } from "./serviceError.js";
import {
  createRequestHash,
  finalizeIdempotency,
  startIdempotency,
} from "./idempotencyService.js";
import { requireTrimmedString, requireValidDate } from "./validationService.js";

const toBookingItem = (row) => ({
  id: row.id,
  booking_date: row.bookingDate,
  status: row.status,
  created_at: row.createdAt,
  package: {
    id: row.pkg.id,
    title: row.pkg.title,
    price: row.pkg.price,
  },
});

export const getBookingCatalog = async () =>
  prisma.package.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
    },
  });

export const getUserBookings = async ({
  userId,
  filter,
  status,
  sortInfo,
  skip,
  take,
}) => {
  const where = {
    userId,
    ...(status && typeof status === "string" ? { status } : {}),
    ...(filter && typeof filter === "string"
      ? {
          OR: [
            {
              pkg: {
                title: {
                  contains: filter,
                  mode: "insensitive",
                },
              },
            },
            {
              status: {
                contains: filter,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const total = await prisma.booking.count({ where });
  const rows = await prisma.booking.findMany({
    where,
    orderBy: {
      [sortInfo.key]: sortInfo.direction,
    },
    skip,
    take,
    select: {
      id: true,
      bookingDate: true,
      status: true,
      createdAt: true,
      pkg: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });

  return {
    total,
    items: rows.map(toBookingItem),
  };
};

export const getUserBookingDetail = async ({ userId, id }) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      bookingDate: true,
      status: true,
      createdAt: true,
      pkg: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });

  if (!booking) {
    throwServiceError({
      status: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: "예약 정보를 찾을 수 없습니다.",
    });
  }

  return toBookingItem(booking);
};

export const createBooking = async ({ userId, idempotencyKey, packageId, bookingDate }) => {
  const normalizedPackageId = requireTrimmedString(packageId, "packageId");
  const normalizedBookingDate = requireValidDate(bookingDate, "bookingDate");

  let idempotencyRecord = null;

  try {
    const requestHash = createRequestHash({
      packageId,
      bookingDate: normalizedBookingDate.toISOString().slice(0, 10),
    });

    const idemResult = await startIdempotency({
      userId,
      idempotencyKey,
      method: "POST",
      path: "/api/bookings",
      requestHash,
    });

    if (idemResult.replayResponse) {
      return idemResult.replayResponse;
    }

    idempotencyRecord = idemResult.record;

    const pkg = await prisma.package.findUnique({
      where: { id: normalizedPackageId },
      select: { id: true },
    });

    if (!pkg) {
      const body = createErrorBody({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "존재하지 않는 패키지입니다.",
      });

      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: 404,
        body,
        state: "failed",
      });

      return { statusCode: 404, body };
    }

    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        packageId: normalizedPackageId,
        bookingDate: normalizedBookingDate,
        status: "confirmed",
      },
      select: {
        id: true,
        status: true,
        bookingDate: true,
      },
    });

    const body = {
      message: "예약이 생성되었습니다.",
      booking: {
        id: booking.id,
        status: booking.status,
        booking_date: booking.bookingDate,
      },
    };

    await invalidateCacheByPrefixes(["catalog:packages:"]);

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 201,
      body,
      state: "completed",
    });

    return { statusCode: 201, body };
  } catch (error) {
    if (error instanceof ServiceError) {
      const errorBody = createErrorBody({
        code: error.code,
        message: error.message,
        details: error.details,
      });

      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: error.status || 500,
        body: errorBody,
        state: "failed",
      });

      throw error;
    }

    const body = createErrorBody({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "예약 생성 중 오류가 발생했습니다.",
    });

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 500,
      body,
      state: "failed",
    });

    throwServiceError({
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "예약 생성 중 오류가 발생했습니다.",
    });
  }
};

export const cancelBooking = async ({ userId, id, reason, idempotencyKey }) => {
  let idempotencyRecord = null;

  try {
    const requestHash = createRequestHash({ bookingId: id, reason: reason || null });

    const idemResult = await startIdempotency({
      userId,
      idempotencyKey,
      method: "PATCH",
      path: `/api/bookings/${id}/cancel`,
      requestHash,
    });

    if (idemResult.replayResponse) {
      return idemResult.replayResponse;
    }

    idempotencyRecord = idemResult.record;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!booking) {
      const body = createErrorBody({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "예약 정보를 찾을 수 없습니다.",
      });

      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: 404,
        body,
        state: "failed",
      });

      return { statusCode: 404, body };
    }

    if (booking.status === "cancelled") {
      const body = {
        message: "이미 취소된 예약입니다.",
        booking: {
          id: booking.id,
          status: booking.status,
          booking_date: booking.bookingDate,
        },
      };

      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: 200,
        body,
        state: "completed",
      });

      return { statusCode: 200, body };
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
      },
      select: {
        id: true,
        status: true,
        bookingDate: true,
      },
    });

    const body = {
      message: "예약이 취소되었습니다.",
      booking: {
        id: updated.id,
        status: updated.status,
        booking_date: updated.bookingDate,
      },
    };

    await invalidateCacheByPrefixes(["catalog:packages:"]);

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 200,
      body,
      state: "completed",
    });

    return { statusCode: 200, body };
  } catch (error) {
    if (error instanceof ServiceError) {
      const errorBody = createErrorBody({
        code: error.code,
        message: error.message,
        details: error.details,
      });

      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: error.status || 500,
        body: errorBody,
        state: "failed",
      });

      throw error;
    }

    const body = createErrorBody({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "예약 취소 중 오류가 발생했습니다.",
    });

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 500,
      body,
      state: "failed",
    });

    throwServiceError({
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "예약 취소 중 오류가 발생했습니다.",
    });
  }
};
