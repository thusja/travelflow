import express from "express";
import {
  createTripPlanHandler,
  deleteTripPlanHandler,
  getTripPlansHandler,
  updateTripPlanHandler,
} from "../controllers/plannerController.js";

const router = express.Router();

router.get("/", getTripPlansHandler);
router.post("/", createTripPlanHandler);
router.put("/:id", updateTripPlanHandler);
router.delete("/:id", deleteTripPlanHandler);

export default router;
