import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  createTravelSuggestion,
  deleteTravelSuggestion,
  getTravelSuggestions,
  updateTravelSuggestionStatus,
} from "../services/suggestionService.js";

export const getTravelSuggestionsHandler = withErrorHandling(async (req, res) => {
  const rows = await getTravelSuggestions({
    status: req.query?.status,
    sort: req.query?.sort,
  });

  return res.json(rows);
}, "여행 제안 목록 조회 오류:");

export const createTravelSuggestionHandler = withErrorHandling(async (req, res) => {
  const { destination, suggestion } = req.body || {};
  const created = await createTravelSuggestion({ destination, suggestion });

  return res.status(201).json({
    message: "여행 제안이 접수되었습니다.",
    suggestion: created,
  });
}, "여행 제안 저장 오류:");

export const updateTravelSuggestionStatusHandler = withErrorHandling(async (req, res) => {
  const { id } = req.params;
  const suggestion = await updateTravelSuggestionStatus({
    id,
    status: req.body?.status,
  });

  return res.json({
    message: "여행 제안 상태가 변경되었습니다.",
    suggestion,
  });
}, "여행 제안 상태 변경 오류:");

export const deleteTravelSuggestionHandler = withErrorHandling(async (req, res) => {
  const { id } = req.params;
  const suggestion = await deleteTravelSuggestion({ id });

  return res.json({
    message: "여행 제안이 삭제되었습니다.",
    suggestion,
  });
}, "여행 제안 삭제 오류:");
