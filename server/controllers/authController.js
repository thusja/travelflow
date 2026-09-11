import { sendError } from "../utils/apiResponse.js";
import {
  loginUser,
  logoutAllSessions,
  logoutSession,
  reactivateUserAccount,
  refreshSession,
  signupUser,
} from "../services/authService.js";
import { toErrorPayload } from "../services/serviceError.js";

// 회원가입 - 순수 저장만
export const signup = async (req, res) => {
  const { nickname, firstname, lastname, email, password, phone } = req.body;

  try {
    const { userId } = await signupUser({
      nickname,
      firstname,
      lastname,
      email,
      password,
      phone,
    });

    return res.status(201).json({ message: "회원가입 성공", userId });
  } catch (err) {
    console.error("회원가입 에러 : ", err);
    return sendError(res, toErrorPayload(err));
  }
};

// 로그인 - JWT 발급
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser({
      email,
      password,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      message: "로그인 성공",
      ...result,
    });
  } catch (err) {
    console.error("로그인 에러 : ", err.message);
    return sendError(res, toErrorPayload(err));
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body || {};

  try {
    const result = await refreshSession({ refreshToken });

    return res.status(200).json({
      message: "토큰이 재발급되었습니다.",
      ...result,
    });
  } catch (err) {
    return sendError(res, toErrorPayload(err));
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body || {};

  try {
    await logoutSession({ refreshToken });

    return res.status(200).json({ message: "로그아웃되었습니다." });
  } catch (err) {
    return sendError(res, toErrorPayload(err));
  }
};

export const logoutAll = async (req, res) => {
  const userId = req.user?.id;

  try {
    await logoutAllSessions({ userId });

    return res
      .status(200)
      .json({ message: "모든 기기에서 로그아웃되었습니다." });
  } catch (err) {
    return sendError(res, toErrorPayload(err));
  }
};

export const reactivateAccount = async (req, res) => {
  const { email } = req.body;

  try {
    await reactivateUserAccount({ email });

    return res.status(200).json({ message: "재가입이 완료되었습니다." });
  } catch (err) {
    console.error("재가입 처리 오류:", err);
    return sendError(res, toErrorPayload(err));
  }
};
