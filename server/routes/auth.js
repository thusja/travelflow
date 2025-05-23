import { Router } from "express";
<<<<<<< HEAD
import { signup, login } from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup); // 회원가입 저장
router.post("/login", login); // 로그인 + JWT
=======
import { signup } from "../controllers/authController.js";

const router = Router();

router.post("/signup", (req, res, next) => {
  console.log("📡 signup 라우터 도착함");
  next();
}, signup);
>>>>>>> e5412063fde660cda7f19e91922738fc2c599272

export default router;
