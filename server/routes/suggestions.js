import express from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

const router = express.Router();
const MAX_DESTINATION_LENGTH = 100;
const MAX_SUGGESTION_LENGTH = 2000;
const ALLOWED_SUGGESTION_STATUSES = new Set(["received", "reviewed"]);

router.get("/", async (req, res) => {
  const rawStatus = String(req.query?.status ?? "").trim();

  if (
    rawStatus &&
    rawStatus !== "all" &&
    !ALLOWED_SUGGESTION_STATUSES.has(rawStatus)
  ) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "status는 all, received, reviewed 중 하나여야 합니다.",
    });
  }

  try {
    const rows = await prisma.travelSuggestion.findMany({
      where:
        rawStatus && rawStatus !== "all" ? { status: rawStatus } : undefined,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        destination: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json(rows);
  } catch (error) {
    console.error("여행 제안 목록 조회 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "여행 제안 목록을 불러오지 못했습니다.",
    });
  }
});

router.post("/", async (req, res) => {
  const { destination, suggestion } = req.body || {};
  const normalizedDestination = String(destination ?? "").trim();
  const normalizedSuggestion = String(suggestion ?? "").trim();

  if (!normalizedDestination || !normalizedSuggestion) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "destination, suggestion은 필수입니다.",
    });
  }

  if (normalizedDestination.length > MAX_DESTINATION_LENGTH) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `destination은 ${MAX_DESTINATION_LENGTH}자 이하여야 합니다.`,
    });
  }

  if (normalizedSuggestion.length > MAX_SUGGESTION_LENGTH) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `suggestion은 ${MAX_SUGGESTION_LENGTH}자 이하여야 합니다.`,
    });
  }

  try {
    const created = await prisma.travelSuggestion.create({
      data: {
        id: uuidv4(),
        destination: normalizedDestination,
        content: normalizedSuggestion,
      },
      select: {
        id: true,
        destination: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "여행 제안이 접수되었습니다.",
      suggestion: created,
    });
  } catch (error) {
    console.error("여행 제안 저장 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "여행 제안 저장에 실패했습니다.",
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const normalizedStatus = String(req.body?.status ?? "").trim();

  if (!ALLOWED_SUGGESTION_STATUSES.has(normalizedStatus)) {
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "status는 received 또는 reviewed여야 합니다.",
    });
  }

  try {
    const updated = await prisma.travelSuggestion.update({
      where: { id },
      data: { status: normalizedStatus },
      select: {
        id: true,
        destination: true,
        content: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "여행 제안 상태가 변경되었습니다.",
      suggestion: updated,
    });
  } catch (error) {
    if (error?.code === "P2025") {
      return sendError(res, {
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 여행 제안을 찾을 수 없습니다.",
      });
    }

    console.error("여행 제안 상태 변경 오류:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "여행 제안 상태 변경에 실패했습니다.",
    });
  }
});

export default router;
