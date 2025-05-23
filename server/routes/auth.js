import { Router } from "express";
import { signup, login } from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup); // 회원가입 저장
router.post("/login", login); // 로그인 + JWT

export default router;
