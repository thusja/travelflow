import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";

export const requireTrimmedString = (value, fieldName) => {
  if (typeof value !== "string") {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `${fieldName}가 필요합니다.`,
    });
  }

  const normalized = value.trim();
  if (!normalized) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `${fieldName}가 필요합니다.`,
    });
  }

  return normalized;
};

export const requireValidDate = (value, fieldName) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `유효하지 않은 ${fieldName} 입니다.`,
    });
  }

  return date;
};

export const normalizeOptionalTrimmedString = (
  value,
  fieldName,
  maxLength,
) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `${fieldName}는 문자열이어야 합니다.`,
    });
  }

  const normalized = value.trim();
  if (maxLength && normalized.length > maxLength) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `${fieldName}는 ${maxLength}자 이하여야 합니다.`,
    });
  }

  return normalized;
};
