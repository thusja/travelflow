import { Router } from "express";
import { signup } from "../controllers/authController.js";

const router = Router();

router.post("/signup", (req, res, next) => {
  console.log("📡 signup 라우터 도착함");
  next();
}, signup);

export default router;
