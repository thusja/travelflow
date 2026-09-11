import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  getPointAndCouponsHandler,
  registerCouponHandler,
} from "../controllers/pointAndCouponController.js";

const router = express.Router();

router.get("/", verifyToken, getPointAndCouponsHandler);
router.post("/register", verifyToken, registerCouponHandler);

export default router;
