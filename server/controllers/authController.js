import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  loginUser,
  logoutAllSessions,
  logoutSession,
  reactivateUserAccount,
  refreshSession,
  signupUser,
} from "../services/authService.js";

// 회원가입 - 순수 저장만
export const signup = withErrorHandling(async (req, res) => {
  const { nickname, firstname, lastname, email, password, phone } = req.body;

  const { userId } = await signupUser({
    nickname,
    firstname,
    lastname,
    email,
    password,
    phone,
  });

  return res.status(201).json({ message: "회원가입 성공", userId });
}, "회원가입 에러 :");

// 로그인 - JWT 발급
export const login = withErrorHandling(async (req, res) => {
  const { email, password } = req.body;

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
}, "로그인 에러 :");

export const refresh = withErrorHandling(async (req, res) => {
  const { refreshToken } = req.body || {};

  const result = await refreshSession({ refreshToken });

  return res.status(200).json({
    message: "토큰이 재발급되었습니다.",
    ...result,
  });
});

export const logout = withErrorHandling(async (req, res) => {
  const { refreshToken } = req.body || {};

  await logoutSession({ refreshToken });

  return res.status(200).json({ message: "로그아웃되었습니다." });
});

export const logoutAll = withErrorHandling(async (req, res) => {
  const userId = req.user?.id;

  await logoutAllSessions({ userId });

  return res
    .status(200)
    .json({ message: "모든 기기에서 로그아웃되었습니다." });
});

export const reactivateAccount = withErrorHandling(async (req, res) => {
  const { email } = req.body;

  await reactivateUserAccount({ email });

  return res.status(200).json({ message: "재가입이 완료되었습니다." });
}, "재가입 처리 오류:");
