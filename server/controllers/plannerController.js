import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  createTripPlan,
  deleteTripPlan,
  getTripPlans,
  updateTripPlan,
} from "../services/plannerService.js";

export const getTripPlansHandler = withErrorHandling(async (req, res) => {
  const plans = await getTripPlans();
  return res.json(plans);
}, "플래너 목록 조회 오류:");

export const createTripPlanHandler = withErrorHandling(async (req, res) => {
  const { destination, travelDate, memo } = req.body || {};
  const plan = await createTripPlan({ destination, travelDate, memo });

  return res.status(201).json({
    message: "플래너 일정이 저장되었습니다.",
    plan,
  });
}, "플래너 저장 오류:");

export const updateTripPlanHandler = withErrorHandling(async (req, res) => {
  const { id } = req.params;
  const { destination, travelDate, memo } = req.body || {};
  const plan = await updateTripPlan({ id, destination, travelDate, memo });

  return res.json({
    message: "플래너 일정이 수정되었습니다.",
    plan,
  });
}, "플래너 수정 오류:");

export const deleteTripPlanHandler = withErrorHandling(async (req, res) => {
  const { id } = req.params;
  await deleteTripPlan({ id });

  return res.json({
    message: "플래너 일정이 삭제되었습니다.",
    deletedId: id,
  });
}, "플래너 삭제 오류:");
