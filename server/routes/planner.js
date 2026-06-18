import express from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

const router = express.Router();
const MAX_DESTINATION_LENGTH = 100;
const MAX_MEMO_LENGTH = 2000;

router.get("/", async (req, res) => {
  try {
    const rows = await prisma.tripPlan.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        destination: true,
        travelDate: true,
        memo: true,
        createdAt: true,
      },
    });

    return res.json(
      rows.map((row) => ({
        id: row.id,
        destination: row.destination,
        travelDate: row.travelDate,
        memo: row.memo,
        createdAt: row.createdAt,
      })),
    );
  } catch (error) {
    console.error("플래너 목록 조회 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "플래너 목록을 불러오지 못했습니다.",
    });
  }
});

router.post("/", async (req, res) => {
  const { destination, travelDate, memo } = req.body || {};
  const normalizedDestination = String(destination ?? "").trim();
  const normalizedMemo = String(memo ?? "").trim();

  if (!normalizedDestination || !travelDate || !normalizedMemo) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "destination, travelDate, memo는 필수입니다.",
    });
  }

  if (normalizedDestination.length > MAX_DESTINATION_LENGTH) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `destination은 ${MAX_DESTINATION_LENGTH}자 이하여야 합니다.`,
    });
  }

  if (normalizedMemo.length > MAX_MEMO_LENGTH) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `memo는 ${MAX_MEMO_LENGTH}자 이하여야 합니다.`,
    });
  }

  const normalizedDate = new Date(travelDate);
  if (Number.isNaN(normalizedDate.getTime())) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "유효하지 않은 travelDate 입니다.",
    });
  }

  try {
    const created = await prisma.tripPlan.create({
      data: {
        id: uuidv4(),
        destination: normalizedDestination,
        travelDate: normalizedDate,
        memo: normalizedMemo,
      },
      select: {
        id: true,
        destination: true,
        travelDate: true,
        memo: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "플래너 일정이 저장되었습니다.",
      plan: created,
    });
  } catch (error) {
    console.error("플래너 저장 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "플래너 저장에 실패했습니다.",
    });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { destination, travelDate, memo } = req.body || {};
  const normalizedDestination = String(destination ?? "").trim();
  const normalizedMemo = String(memo ?? "").trim();

  if (!normalizedDestination || !travelDate || !normalizedMemo) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "destination, travelDate, memo는 필수입니다.",
    });
  }

  if (normalizedDestination.length > MAX_DESTINATION_LENGTH) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `destination은 ${MAX_DESTINATION_LENGTH}자 이하여야 합니다.`,
    });
  }

  if (normalizedMemo.length > MAX_MEMO_LENGTH) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `memo는 ${MAX_MEMO_LENGTH}자 이하여야 합니다.`,
    });
  }

  const normalizedDate = new Date(travelDate);
  if (Number.isNaN(normalizedDate.getTime())) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "유효하지 않은 travelDate 입니다.",
    });
  }

  try {
    const updated = await prisma.tripPlan.update({
      where: { id },
      data: {
        destination: normalizedDestination,
        travelDate: normalizedDate,
        memo: normalizedMemo,
      },
      select: {
        id: true,
        destination: true,
        travelDate: true,
        memo: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "플래너 일정이 수정되었습니다.",
      plan: updated,
    });
  } catch (error) {
    if (error?.code === "P2025") {
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 플래너 일정을 찾을 수 없습니다.",
      });
    }

    console.error("플래너 수정 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "플래너 수정에 실패했습니다.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.tripPlan.delete({
      where: { id },
    });

    return res.json({
      message: "플래너 일정이 삭제되었습니다.",
      deletedId: id,
    });
  } catch (error) {
    if (error?.code === "P2025") {
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 플래너 일정을 찾을 수 없습니다.",
      });
    }

    console.error("플래너 삭제 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "플래너 삭제에 실패했습니다.",
    });
  }
});

export default router;
