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
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `${path} failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  return data;
};

const requestJsonExpectStatus = async (path, expectedStatus, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (response.status !== expectedStatus) {
    throw new Error(
      `${path} expected status ${expectedStatus} but got ${response.status}: ${JSON.stringify(data)}`,
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

  await requestJsonExpectStatus("/api/planner", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: " ",
      travelDate: "2026-07-01",
      memo: "스모크",
    }),
  });

  await requestJsonExpectStatus("/api/planner", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: "A".repeat(101),
      travelDate: "2026-07-01",
      memo: "스모크",
    }),
  });

  await requestJsonExpectStatus(`/api/planner/${plannerPost.plan.id}`, 400, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: "오사카",
      travelDate: "invalid-date",
      memo: "업데이트",
    }),
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

  const suggestionPatch = await requestJson(
    `/api/suggestions/${suggestionPost.suggestion.id}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reviewed" }),
    },
  );

  await requestJsonExpectStatus("/api/suggestions", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: "부산",
      suggestion: " ",
    }),
  });

  await requestJsonExpectStatus("/api/suggestions", 400, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destination: "B".repeat(101),
      suggestion: "야간 코스",
    }),
  });

  await requestJsonExpectStatus(
    `/api/suggestions/${suggestionPost.suggestion.id}/status`,
    400,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid" }),
    },
  );

  const suggestionList = await requestJson("/api/suggestions");
  const suggestionTop = suggestionList[0];
  const reviewedSuggestions = await requestJson(
    "/api/suggestions?status=reviewed",
  );
  await requestJsonExpectStatus("/api/suggestions?status=bad", 400);
  const oldestSuggestions = await requestJson(
    "/api/suggestions?status=reviewed&sort=oldest",
  );
  await requestJsonExpectStatus("/api/suggestions?sort=bad", 400);

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
  assertEqual(
    "suggestionPatch.status",
    "reviewed",
    suggestionPatch.suggestion.status,
  );
  assertEqual("suggestionTop.status", "reviewed", suggestionTop.status);

  if (
    !reviewedSuggestions.some(
      (item) => item.id === suggestionPost.suggestion.id,
    )
  ) {
    throw new Error(
      "suggestion filter failed: patched suggestion not found in reviewed list",
    );
  }

  const reviewedDescTimestamps = reviewedSuggestions
    .map((item) => new Date(item.createdAt).getTime())
    .filter((value) => Number.isFinite(value));
  const reviewedAscTimestamps = oldestSuggestions
    .map((item) => new Date(item.createdAt).getTime())
    .filter((value) => Number.isFinite(value));

  const isDescSorted = reviewedDescTimestamps.every(
    (value, index) => index === 0 || reviewedDescTimestamps[index - 1] >= value,
  );
  const isAscSorted = reviewedAscTimestamps.every(
    (value, index) => index === 0 || reviewedAscTimestamps[index - 1] <= value,
  );

  if (!isDescSorted || !isAscSorted) {
    throw new Error("suggestion sort failed: expected latest/oldest ordering");
  }

  await requestJson(`/api/suggestions/${suggestionPost.suggestion.id}`, {
    method: "DELETE",
  });

  const suggestionsAfterDelete = await requestJson("/api/suggestions");
  const deletedSuggestion = suggestionsAfterDelete.find(
    (item) => item.id === suggestionPost.suggestion.id,
  );

  if (deletedSuggestion) {
    throw new Error(
      "suggestion delete failed: deleted suggestion still exists in list",
    );
  }

  console.log("[smoke] plannerPostId=" + plannerPost.plan.id);
  console.log("[smoke] plannerUpdateDelete=PASS");
  console.log("[smoke] plannerValidation=PASS");
  console.log("[smoke] suggestionPostId=" + suggestionPost.suggestion.id);
  console.log("[smoke] suggestionStatusPatch=PASS");
  console.log("[smoke] suggestionValidation=PASS");
  console.log("[smoke] suggestionStatusFilter=PASS");
  console.log("[smoke] suggestionSort=PASS");
  console.log("[smoke] suggestionDelete=PASS");
  console.log("[smoke] utf8-check=PASS");
};

main().catch((error) => {
  console.error("[smoke] utf8-check=FAIL", error.message);
  process.exit(1);
});
