import { sendError } from "./apiResponse.js";
import { toErrorPayload } from "../services/serviceError.js";

export const withErrorHandling = (handler, logLabel) => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      if (logLabel) {
        console.error(logLabel, error);
      }
      return sendError(res, toErrorPayload(error));
    }
  };
};
