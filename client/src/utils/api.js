import { requestApi } from "@/utils/request.js";

export const getPackages = async () => {
  return requestApi("/api/packages", {}, { errorMessage: "데이터 로드 실패" });
};

export const getPlannerPlans = async () => {
  return requestApi("/api/planner", {}, { errorMessage: "플래너 목록 조회 실패" });
};

export const createPlannerPlan = async (payload) => {
  return requestApi(
    "/api/planner",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    { errorMessage: "플래너 저장 실패" },
  );
};

export const updatePlannerPlan = async (planId, payload) => {
  return requestApi(
    `/api/planner/${planId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    { errorMessage: "플래너 수정 실패" },
  );
};

export const deletePlannerPlan = async (planId) => {
  return requestApi(
    `/api/planner/${planId}`,
    {
      method: "DELETE",
    },
    { errorMessage: "플래너 삭제 실패" },
  );
};

export const getTravelSuggestions = async ({
  status = "all",
  sort = "latest",
} = {}) => {
  const params = new URLSearchParams();
  if (status && status !== "all") {
    params.set("status", status);
  }
  if (sort && sort !== "latest") {
    params.set("sort", sort);
  }

  const query = params.toString();
  const url = query
    ? `/api/suggestions?${query}`
    : "/api/suggestions";

  return requestApi(url, {}, { errorMessage: "여행 제안 목록 조회 실패" });
};

export const createTravelSuggestion = async (payload) => {
  return requestApi(
    "/api/suggestions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    { errorMessage: "여행 제안 저장 실패" },
  );
};

export const updateTravelSuggestionStatus = async (suggestionId, status) => {
  return requestApi(
    `/api/suggestions/${suggestionId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    { errorMessage: "여행 제안 상태 변경 실패" },
  );
};

export const deleteTravelSuggestion = async (suggestionId) => {
  return requestApi(
    `/api/suggestions/${suggestionId}`,
    {
      method: "DELETE",
    },
    { errorMessage: "여행 제안 삭제 실패" },
  );
};
