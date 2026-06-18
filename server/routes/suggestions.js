import express from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

const router = express.Router();
const MAX_DESTINATION_LENGTH = 100;
const MAX_SUGGESTION_LENGTH = 2000;

router.get("/", async (req, res) => {
  try {
    const rows = await prisma.travelSuggestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        destination: true,
        content: true,
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

export default router;
