import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";

const MAX_DESTINATION_LENGTH = 100;
const MAX_MEMO_LENGTH = 2000;

const validatePlannerPayload = ({ destination, travelDate, memo }) => {
  const normalizedDestination = String(destination ?? "").trim();
  const normalizedMemo = String(memo ?? "").trim();

  if (!normalizedDestination || !travelDate || !normalizedMemo) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "destination, travelDate, memo는 필수입니다.",
    });
  }

  if (normalizedDestination.length > MAX_DESTINATION_LENGTH) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `destination은 ${MAX_DESTINATION_LENGTH}자 이하여야 합니다.`,
    });
  }

  if (normalizedMemo.length > MAX_MEMO_LENGTH) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `memo는 ${MAX_MEMO_LENGTH}자 이하여야 합니다.`,
    });
  }

  const normalizedDate = new Date(travelDate);
  if (Number.isNaN(normalizedDate.getTime())) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "유효하지 않은 travelDate 입니다.",
    });
  }

  return {
    destination: normalizedDestination,
    travelDate: normalizedDate,
    memo: normalizedMemo,
  };
};

export const getTripPlans = async () => {
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

  return rows.map((row) => ({
    id: row.id,
    destination: row.destination,
    travelDate: row.travelDate,
    memo: row.memo,
    createdAt: row.createdAt,
  }));
};

export const createTripPlan = async ({ destination, travelDate, memo }) => {
  const payload = validatePlannerPayload({ destination, travelDate, memo });

  return prisma.tripPlan.create({
    data: {
      id: uuidv4(),
      destination: payload.destination,
      travelDate: payload.travelDate,
      memo: payload.memo,
    },
    select: {
      id: true,
      destination: true,
      travelDate: true,
      memo: true,
      createdAt: true,
    },
  });
};

export const updateTripPlan = async ({ id, destination, travelDate, memo }) => {
  const payload = validatePlannerPayload({ destination, travelDate, memo });

  try {
    return await prisma.tripPlan.update({
      where: { id },
      data: {
        destination: payload.destination,
        travelDate: payload.travelDate,
        memo: payload.memo,
      },
      select: {
        id: true,
        destination: true,
        travelDate: true,
        memo: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      throwServiceError({
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 플래너 일정을 찾을 수 없습니다.",
      });
    }

    throw error;
  }
};

export const deleteTripPlan = async ({ id }) => {
  try {
    await prisma.tripPlan.delete({
      where: { id },
    });
  } catch (error) {
    if (error?.code === "P2025") {
      throwServiceError({
        status: 404,
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: "해당 플래너 일정을 찾을 수 없습니다.",
      });
    }

    throw error;
  }
};
