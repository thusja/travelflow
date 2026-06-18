const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:5000";

const plannerPayload = {
  destination: "도쿄",
  travelDate: "2026-07-01",
  memo: "스모크 테스트 일정",
};

const suggestionPayload = {
  destination: "부산",
  suggestion: "야간 해변 산책 코스 추가",
};

const assertEqual = (label, expected, actual) => {
  if (expected !== actual) {
    throw new Error(
      `${label} mismatch: expected="${expected}", actual="${actual}"`,
    );
  }
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `${path} failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  return data;
};

const main = async () => {
  const plannerPost = await requestJson("/api/planner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plannerPayload),
  });

  const plannerList = await requestJson("/api/planner");
  const plannerTop = plannerList[0];

  const plannerPutPayload = {
    destination: "오사카",
    travelDate: "2026-07-03",
    memo: "업데이트된 스모크 일정",
  };

  const plannerPut = await requestJson(`/api/planner/${plannerPost.plan.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plannerPutPayload),
  });

  const plannerAfterUpdate = await requestJson("/api/planner");
  const updatedPlan = plannerAfterUpdate.find(
    (plan) => plan.id === plannerPost.plan.id,
  );

  await requestJson(`/api/planner/${plannerPost.plan.id}`, {
    method: "DELETE",
  });

  const plannerAfterDelete = await requestJson("/api/planner");
  const deletedPlan = plannerAfterDelete.find(
    (plan) => plan.id === plannerPost.plan.id,
  );

  const suggestionPost = await requestJson("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(suggestionPayload),
  });

  const suggestionList = await requestJson("/api/suggestions");
  const suggestionTop = suggestionList[0];

  assertEqual(
    "planner.destination",
    plannerPayload.destination,
    plannerPost.plan.destination,
  );
  assertEqual("planner.memo", plannerPayload.memo, plannerPost.plan.memo);
  assertEqual(
    "plannerTop.destination",
    plannerPayload.destination,
    plannerTop.destination,
  );
  assertEqual("plannerTop.memo", plannerPayload.memo, plannerTop.memo);
  assertEqual(
    "plannerPut.destination",
    plannerPutPayload.destination,
    plannerPut.plan.destination,
  );
  assertEqual("plannerPut.memo", plannerPutPayload.memo, plannerPut.plan.memo);
  assertEqual(
    "updatedPlan.destination",
    plannerPutPayload.destination,
    updatedPlan?.destination,
  );
  assertEqual("updatedPlan.memo", plannerPutPayload.memo, updatedPlan?.memo);

  if (deletedPlan) {
    throw new Error("planner delete failed: deleted plan still exists in list");
  }

  assertEqual(
    "suggestion.destination",
    suggestionPayload.destination,
    suggestionPost.suggestion.destination,
  );
  assertEqual(
    "suggestion.content",
    suggestionPayload.suggestion,
    suggestionPost.suggestion.content,
  );
  assertEqual(
    "suggestionTop.destination",
    suggestionPayload.destination,
    suggestionTop.destination,
  );
  assertEqual(
    "suggestionTop.content",
    suggestionPayload.suggestion,
    suggestionTop.content,
  );

  console.log("[smoke] plannerPostId=" + plannerPost.plan.id);
  console.log("[smoke] plannerUpdateDelete=PASS");
  console.log("[smoke] suggestionPostId=" + suggestionPost.suggestion.id);
  console.log("[smoke] utf8-check=PASS");
};

main().catch((error) => {
  console.error("[smoke] utf8-check=FAIL", error.message);
  process.exit(1);
});
