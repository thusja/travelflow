import { ERROR_CODES } from "../utils/apiResponse.js";

export class ServiceError extends Error {
  constructor({ status = 500, code = ERROR_CODES.INTERNAL_ERROR, message = "서버 오류", details } = {}) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const throwServiceError = (payload) => {
  throw new ServiceError(payload);
};

export const toErrorPayload = (error) => {
  if (error instanceof ServiceError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  return {
    status: 500,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: "서버 오류",
  };
};
