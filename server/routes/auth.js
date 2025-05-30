import { Router } from "express";
import { signup, login, reactivateAccount } from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup); // 회원가입 저장
router.post("/login", login); // 로그인 + JWT
router.post("/reactivate", reactivateAccount); // 탈퇴 후 재가입

export default router;
