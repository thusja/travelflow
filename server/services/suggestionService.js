import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";
import { requireTrimmedString } from "./validationService.js";

const MAX_DESTINATION_LENGTH = 100;
const MAX_SUGGESTION_LENGTH = 2000;
const ALLOWED_SUGGESTION_STATUSES = new Set(["received", "reviewed"]);
const ALLOWED_SUGGESTION_SORTS = new Set(["latest", "oldest"]);

export const getTravelSuggestions = async ({ status, sort }) => {
  const rawStatus = String(status ?? "").trim();
  const rawSort = String(sort ?? "latest").trim() || "latest";

  if (
    rawStatus &&
    rawStatus !== "all" &&
    !ALLOWED_SUGGESTION_STATUSES.has(rawStatus)
  ) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "status는 all, received, reviewed 중 하나여야 합니다.",
    });
  }

  if (!ALLOWED_SUGGESTION_SORTS.has(rawSort)) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "sort는 latest 또는 oldest여야 합니다.",
    });
  }

  return prisma.travelSuggestion.findMany({
    where: rawStatus && rawStatus !== "all" ? { status: rawStatus } : undefined,
    orderBy: { createdAt: rawSort === "oldest" ? "asc" : "desc" },
    take: 20,
    select: {
      id: true,
      destination: true,
      content: true,
      status: true,
      createdAt: true,
    },
  });
};

export const createTravelSuggestion = async ({ destination, suggestion }) => {
  const normalizedDestination = requireTrimmedString(destination, "destination");
  const normalizedSuggestion = requireTrimmedString(suggestion, "suggestion");

  if (normalizedDestination.length > MAX_DESTINATION_LENGTH) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `destination은 ${MAX_DESTINATION_LENGTH}자 이하여야 합니다.`,
    });
  }

  if (normalizedSuggestion.length > MAX_SUGGESTION_LENGTH) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `suggestion은 ${MAX_SUGGESTION_LENGTH}자 이하여야 합니다.`,
    });
  }

  return prisma.travelSuggestion.create({
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
};

export const updateTravelSuggestionStatus = async ({ id, status }) => {
  const normalizedStatus = String(status ?? "").trim();

  if (!ALLOWED_SUGGESTION_STATUSES.has(normalizedStatus)) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "status는 received 또는 reviewed여야 합니다.",
    });
  }

  try {
    return await prisma.travelSuggestion.update({
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
  } catch (error) {
    if (error?.code === "P2025") {
      throwServiceError({
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 여행 제안을 찾을 수 없습니다.",
      });
    }

    throw error;
  }
};

export const deleteTravelSuggestion = async ({ id }) => {
  try {
    return await prisma.travelSuggestion.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      throwServiceError({
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 여행 제안을 찾을 수 없습니다.",
      });
    }

    throw error;
  }
};
