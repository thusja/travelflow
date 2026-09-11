import { Router } from "express";
import {
  signup,
  login,
  reactivateAccount,
  refresh,
  logout,
  logoutAll,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post("/signup", signup); // 회원가입 저장
router.post("/login", login); // 로그인 + JWT
router.post("/reactivate", reactivateAccount); // 탈퇴 후 재가입
router.post("/refresh", refresh); // access/refresh 재발급
router.post("/logout", logout); // 현재 세션 로그아웃
router.post("/logout-all", verifyToken, logoutAll); // 전체 세션 로그아웃

export default router;
