import express from "express";
import {
  createTravelSuggestionHandler,
  deleteTravelSuggestionHandler,
  getTravelSuggestionsHandler,
  updateTravelSuggestionStatusHandler,
} from "../controllers/suggestionController.js";

const router = express.Router();

router.get("/", getTravelSuggestionsHandler);
router.post("/", createTravelSuggestionHandler);
router.patch("/:id/status", updateTravelSuggestionStatusHandler);
router.delete("/:id", deleteTravelSuggestionHandler);

export default router;
