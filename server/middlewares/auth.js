import jwt from "jsonwebtoken";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, {
      status: 401,
      code: ERROR_CODES.AUTH_UNAUTHORIZED,
      message: "인증 토큰이 없습니다.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 이후 라우터에서 req.user.id 사용 가능
    next();
  } catch (err) {
    return sendError(res, {
      status: 403,
      code: ERROR_CODES.AUTH_FORBIDDEN,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};
