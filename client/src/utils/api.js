export const getPackages = async () => {
  const res = await fetch("http://localhost:5000/api/packages");
  if (!res.ok) throw new Error("데이터 로드 실패");
  return await res.json();
};

export const getPlannerPlans = async () => {
  const res = await fetch("http://localhost:5000/api/planner");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "플래너 목록 조회 실패");
  }
  return data;
};

export const createPlannerPlan = async (payload) => {
  const res = await fetch("http://localhost:5000/api/planner", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "플래너 저장 실패");
  }
  return data;
};

export const updatePlannerPlan = async (planId, payload) => {
  const res = await fetch(`http://localhost:5000/api/planner/${planId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "플래너 수정 실패");
  }
  return data;
};

export const deletePlannerPlan = async (planId) => {
  const res = await fetch(`http://localhost:5000/api/planner/${planId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "플래너 삭제 실패");
  }
  return data;
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
    ? `http://localhost:5000/api/suggestions?${query}`
    : "http://localhost:5000/api/suggestions";

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "여행 제안 목록 조회 실패");
  }
  return data;
};

export const createTravelSuggestion = async (payload) => {
  const res = await fetch("http://localhost:5000/api/suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "여행 제안 저장 실패");
  }
  return data;
};

export const updateTravelSuggestionStatus = async (suggestionId, status) => {
  const res = await fetch(
    `http://localhost:5000/api/suggestions/${suggestionId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "여행 제안 상태 변경 실패");
  }
  return data;
};
