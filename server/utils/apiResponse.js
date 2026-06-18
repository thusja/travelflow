export const ERROR_CODES = {
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",
  AUTH_REFRESH_INVALID: "AUTH_REFRESH_INVALID",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  CONFLICT_DUPLICATE: "CONFLICT_DUPLICATE",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

export const createErrorBody = ({ code, message, details } = {}) => {
  const normalizedMessage = message || "요청 처리 중 오류가 발생했습니다.";

  const body = {
    success: false,
    message: normalizedMessage,
    error: {
      code: code || ERROR_CODES.INTERNAL_ERROR,
      message: normalizedMessage,
    },
    meta: {},
  };

  if (details !== undefined) {
    body.error.details = details;
  }

  return body;
};

export const sendError = (res, { status, code, message, details } = {}) => {
  const body = createErrorBody({ code, message, details });

  return res.status(status || 500).json(body);
};
