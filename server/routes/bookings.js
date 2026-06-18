import express from "express";
import crypto from "crypto";
import prisma from "../db/index.js";
import { verifyToken } from "../middlewares/auth.js";
import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";

const router = express.Router();

const startIdempotency = async ({
  userId,
  idempotencyKey,
  method,
  path,
  requestHash,
  res,
}) => {
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    return { proceed: true, record: null };
  }

  const key = idempotencyKey.trim();
  if (!key) {
    return { proceed: true, record: null };
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

    return { proceed: true, record };
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
      res.status(409).json({
        message: "멱등성 처리 중 충돌이 발생했습니다. 다시 시도해주세요.",
      });
      return { proceed: false, record: null };
    }

    if (existing.requestHash !== requestHash) {
      res.status(409).json({
        message: "동일한 Idempotency-Key로 다른 요청 본문을 보낼 수 없습니다.",
      });
      return { proceed: false, record: null };
    }

    if (
      (existing.state === "completed" || existing.state === "failed") &&
      existing.responseBody
    ) {
      res.status(existing.statusCode || 200).json(existing.responseBody);
      return { proceed: false, record: null };
    }

    res.status(409).json({
      message: "동일 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.",
    });
    return { proceed: false, record: null };
  }
};

const finalizeIdempotency = async ({ record, statusCode, body, state }) => {
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

router.get("/catalog", async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    res.json(packages);
  } catch (err) {
    console.error("예약 카탈로그 조회 오류:", err);
    res.status(500).json({ message: "예약 카탈로그 조회 실패" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const { filter = "", status, sort } = req.query;
    const { page, size, skip, take } = parsePageSize(req.query);
    const sortInfo = parseSort(sort, ["bookingDate", "status", "createdAt"], {
      key: "bookingDate",
      direction: "desc",
    });

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

    const items = rows.map((row) => ({
      id: row.id,
      booking_date: row.bookingDate,
      status: row.status,
      created_at: row.createdAt,
      package: {
        id: row.pkg.id,
        title: row.pkg.title,
        price: row.pkg.price,
      },
    }));

    if (hasListQuery(req.query)) {
      return res.json({
        items,
        meta: createListMeta({ page, size, total }),
      });
    }

    res.json(items);
  } catch (err) {
    console.error("예약 목록 조회 오류:", err);
    res.status(500).json({ message: "예약 목록 조회 실패" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
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
      return res.status(404).json({ message: "예약 정보를 찾을 수 없습니다." });
    }

    res.json({
      id: booking.id,
      booking_date: booking.bookingDate,
      status: booking.status,
      created_at: booking.createdAt,
      package: {
        id: booking.pkg.id,
        title: booking.pkg.title,
        price: booking.pkg.price,
      },
    });
  } catch (err) {
    console.error("예약 상세 조회 오류:", err);
    res.status(500).json({ message: "예약 상세 조회 실패" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const idempotencyKey = req.headers["idempotency-key"];
  const { packageId, bookingDate } = req.body;

  let idempotencyRecord = null;

  try {
    if (!packageId || !bookingDate) {
      return res
        .status(400)
        .json({ message: "packageId와 bookingDate가 필요합니다." });
    }

    const normalizedBookingDate = new Date(bookingDate);
    if (Number.isNaN(normalizedBookingDate.getTime())) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 bookingDate 입니다." });
    }

    const requestHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          packageId,
          bookingDate: normalizedBookingDate.toISOString().slice(0, 10),
        }),
      )
      .digest("hex");

    const idemResult = await startIdempotency({
      userId,
      idempotencyKey,
      method: "POST",
      path: "/api/bookings",
      requestHash,
      res,
    });

    if (!idemResult.proceed) {
      return;
    }

    idempotencyRecord = idemResult.record;

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      select: { id: true },
    });

    if (!pkg) {
      const body = { message: "존재하지 않는 패키지입니다." };
      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: 404,
        body,
        state: "failed",
      });
      return res.status(404).json(body);
    }

    const booking = await prisma.booking.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        packageId,
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

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 201,
      body,
      state: "completed",
    });

    return res.status(201).json(body);
  } catch (err) {
    console.error("예약 생성 오류:", err);
    const body = { message: "예약 생성 중 오류가 발생했습니다." };
    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 500,
      body,
      state: "failed",
    });

    res.status(500).json(body);
  }
});

router.patch("/:id/cancel", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const idempotencyKey = req.headers["idempotency-key"];
  const { reason = null } = req.body || {};

  let idempotencyRecord = null;

  try {
    const requestHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ bookingId: id, reason }))
      .digest("hex");

    const idemResult = await startIdempotency({
      userId,
      idempotencyKey,
      method: "PATCH",
      path: `/api/bookings/${id}/cancel`,
      requestHash,
      res,
    });

    if (!idemResult.proceed) {
      return;
    }

    idempotencyRecord = idemResult.record;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!booking) {
      const body = { message: "예약 정보를 찾을 수 없습니다." };
      await finalizeIdempotency({
        record: idempotencyRecord,
        statusCode: 404,
        body,
        state: "failed",
      });
      return res.status(404).json(body);
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
      return res.status(200).json(body);
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

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 200,
      body,
      state: "completed",
    });

    return res.status(200).json(body);
  } catch (err) {
    console.error("예약 취소 오류:", err);
    const body = { message: "예약 취소 중 오류가 발생했습니다." };

    await finalizeIdempotency({
      record: idempotencyRecord,
      statusCode: 500,
      body,
      state: "failed",
    });

    res.status(500).json(body);
  }
});

export default router;
