import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  cancelBookingHandler,
  createBookingHandler,
  getBookingCatalogHandler,
  getBookingDetailHandler,
  getBookingsHandler,
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/catalog", getBookingCatalogHandler);
router.get("/", verifyToken, getBookingsHandler);
router.get("/:id", verifyToken, getBookingDetailHandler);
router.post("/", verifyToken, createBookingHandler);
router.patch("/:id/cancel", verifyToken, cancelBookingHandler);

export default router;
