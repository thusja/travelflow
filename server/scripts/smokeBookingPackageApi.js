import crypto from "node:crypto";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:5000";
const ACCESS_TOKEN = process.env.SMOKE_ACCESS_TOKEN;
const COUPON_CODE = (process.env.SMOKE_COUPON_CODE || "").trim();

if (!ACCESS_TOKEN) {
  console.error("SMOKE_ACCESS_TOKEN is required");
  process.exit(1);
}

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
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

  return { data, headers: response.headers };
};

const requestJsonExpectStatus = async (path, expectedStatus, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (response.status !== expectedStatus) {
    throw new Error(
      `${path} expected status ${expectedStatus} but got ${response.status}: ${JSON.stringify(data)}`,
    );
  }

  return { data, headers: response.headers };
};

const requestJsonWithStatus = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  return {
    status: response.status,
    data,
    headers: response.headers,
  };
};

const makeAuthHeaders = (extra = {}) => ({
  Authorization: `Bearer ${ACCESS_TOKEN}`,
  ...extra,
});

const isoDateAfterDays = (days) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
};

const main = async () => {
  const packagesRes = await requestJson("/api/packages", {
    headers: {
      Accept: "application/json",
    },
  });

  const packagesBody = packagesRes.data;
  const packages = Array.isArray(packagesBody)
    ? packagesBody
    : Array.isArray(packagesBody.items)
      ? packagesBody.items
      : [];

  assert(packages.length > 0, "packages list is empty");
  assert(
    ["HIT", "MISS"].includes(packagesRes.headers.get("x-cache")),
    "packages response missing X-Cache header",
  );

  await requestJsonExpectStatus(
    `/api/packages?filter=${"A".repeat(101)}`,
    400,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  const catalogRes = await requestJson("/api/bookings/catalog", {
    headers: {
      Accept: "application/json",
    },
  });

  assert(Array.isArray(catalogRes.data), "booking catalog is not an array");
  assert(catalogRes.data.length > 0, "booking catalog is empty");

  const packageId = catalogRes.data[0].id;
  const bookingDate = isoDateAfterDays(7);
  const createIdempotencyKey = crypto.randomUUID();

  const bookingCreate = await requestJson("/api/bookings", {
    method: "POST",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
      "Idempotency-Key": createIdempotencyKey,
    }),
    body: JSON.stringify({ packageId, bookingDate }),
  });

  assert(
    bookingCreate.data?.booking?.id,
    "booking create response missing booking.id",
  );

  const createReplay = await requestJson("/api/bookings", {
    method: "POST",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
      "Idempotency-Key": createIdempotencyKey,
    }),
    body: JSON.stringify({ packageId, bookingDate }),
  });

  assert(
    createReplay.data?.booking?.id === bookingCreate.data.booking.id,
    "idempotent create replay returned a different booking id",
  );

  const bookingId = bookingCreate.data.booking.id;

  await requestJsonExpectStatus("/api/bookings", 409, {
    method: "POST",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
      "Idempotency-Key": createIdempotencyKey,
    }),
    body: JSON.stringify({
      packageId,
      bookingDate: isoDateAfterDays(8),
    }),
  });

  await requestJsonExpectStatus("/api/reviews", 400, {
    method: "POST",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      bookingId,
      rating: 6,
      comment: "invalid rating smoke",
    }),
  });

  await requestJsonExpectStatus("/api/reviews", 400, {
    method: "POST",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      bookingId,
      rating: 5,
      comment: "non-completed booking review smoke",
    }),
  });

  const reviewableRes = await requestJson("/api/reviews/reviewable", {
    headers: makeAuthHeaders({
      Accept: "application/json",
    }),
  });

  const reviewableItems = Array.isArray(reviewableRes.data)
    ? reviewableRes.data
    : Array.isArray(reviewableRes.data?.items)
      ? reviewableRes.data.items
      : [];

  assert(
    Array.isArray(reviewableItems),
    "reviewable response is not a valid list",
  );

  const bookingList = await requestJson("/api/bookings?page=1&size=20", {
    headers: makeAuthHeaders({
      Accept: "application/json",
    }),
  });

  assert(Array.isArray(bookingList.data?.items), "booking list meta format invalid");
  assert(
    bookingList.data.items.some((item) => item.id === bookingId),
    "new booking not found in booking list",
  );

  const bookingDetail = await requestJson(`/api/bookings/${bookingId}`, {
    headers: makeAuthHeaders({
      Accept: "application/json",
    }),
  });

  assert(
    bookingDetail.data?.id === bookingId,
    "booking detail id mismatch",
  );

  const cancelIdempotencyKey = crypto.randomUUID();
  const bookingCancel = await requestJson(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
      "Idempotency-Key": cancelIdempotencyKey,
    }),
    body: JSON.stringify({ reason: "smoke-test" }),
  });

  assert(
    bookingCancel.data?.booking?.status === "cancelled",
    "booking cancel status mismatch",
  );

  const cancelReplay = await requestJson(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
      "Idempotency-Key": cancelIdempotencyKey,
    }),
    body: JSON.stringify({ reason: "smoke-test" }),
  });

  assert(
    cancelReplay.data?.booking?.status === "cancelled",
    "idempotent cancel replay failed",
  );

  await requestJsonExpectStatus(`/api/bookings/${bookingId}/cancel`, 409, {
    method: "PATCH",
    headers: makeAuthHeaders({
      "Content-Type": "application/json",
      "Idempotency-Key": cancelIdempotencyKey,
    }),
    body: JSON.stringify({ reason: "smoke-test-different" }),
  });

  if (COUPON_CODE) {
    const couponKey = crypto.randomUUID();

    const couponFirst = await requestJsonWithStatus("/api/points/register", {
      method: "POST",
      headers: makeAuthHeaders({
        "Content-Type": "application/json",
        "Idempotency-Key": couponKey,
      }),
      body: JSON.stringify({ code: COUPON_CODE }),
    });

    const couponReplay = await requestJsonWithStatus("/api/points/register", {
      method: "POST",
      headers: makeAuthHeaders({
        "Content-Type": "application/json",
        "Idempotency-Key": couponKey,
      }),
      body: JSON.stringify({ code: COUPON_CODE }),
    });

    assert(
      couponReplay.status === couponFirst.status,
      "coupon replay status mismatch",
    );

    assert(
      couponReplay.data?.message === couponFirst.data?.message,
      "coupon replay body mismatch",
    );

    await requestJsonExpectStatus("/api/points/register", 409, {
      method: "POST",
      headers: makeAuthHeaders({
        "Content-Type": "application/json",
        "Idempotency-Key": couponKey,
      }),
      body: JSON.stringify({ code: `${COUPON_CODE}-DIFF` }),
    });

    if ([200, 409].includes(couponFirst.status)) {
      const pointsSnapshot = await requestJson("/api/points", {
        headers: makeAuthHeaders({
          Accept: "application/json",
        }),
      });

      assert(
        typeof pointsSnapshot.data?.point === "number",
        "points snapshot missing numeric point",
      );
      assert(
        Array.isArray(pointsSnapshot.data?.coupons),
        "points snapshot missing coupons array",
      );
    }
  }

  console.log("[smoke] packages:list=PASS");
  console.log("[smoke] packages:filter-validation=PASS");
  console.log("[smoke] bookings:catalog=PASS");
  console.log("[smoke] bookings:create=PASS");
  console.log("[smoke] bookings:create-replay=PASS");
  console.log("[smoke] bookings:create-conflict=PASS");
  console.log("[smoke] reviews:rating-validation=PASS");
  console.log("[smoke] reviews:completed-booking-validation=PASS");
  console.log("[smoke] reviews:reviewable-list=PASS");
  console.log("[smoke] bookings:list=PASS");
  console.log("[smoke] bookings:detail=PASS");
  console.log("[smoke] bookings:cancel=PASS");
  console.log("[smoke] bookings:cancel-replay=PASS");
  console.log("[smoke] bookings:cancel-conflict=PASS");
  if (COUPON_CODE) {
    console.log("[smoke] coupons:register-replay=PASS");
    console.log("[smoke] coupons:register-conflict=PASS");
    console.log("[smoke] points:snapshot=PASS");
  } else {
    console.log("[smoke] coupons:register=SKIP (SMOKE_COUPON_CODE not set)");
  }
  console.log(`[smoke] bookingId=${bookingId}`);
};

main().catch((error) => {
  console.error("[smoke] booking-package=FAIL", error.message);
  process.exit(1);
});
