import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";
import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  cancelBooking,
  createBooking,
  getBookingCatalog,
  getUserBookingDetail,
  getUserBookings,
} from "../services/bookingService.js";

export const getBookingCatalogHandler = withErrorHandling(async (req, res) => {
  const packages = await getBookingCatalog();
  return res.json(packages);
}, "예약 카탈로그 조회 오류:");

export const getBookingsHandler = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { filter = "", status, sort } = req.query;
  const { page, size, skip, take } = parsePageSize(req.query);
  const sortInfo = parseSort(sort, ["bookingDate", "status", "createdAt"], {
    key: "bookingDate",
    direction: "desc",
  });

  const { total, items } = await getUserBookings({
    userId,
    filter,
    status,
    sortInfo,
    skip,
    take,
  });

  if (hasListQuery(req.query)) {
    return res.json({
      items,
      meta: createListMeta({ page, size, total }),
    });
  }

  return res.json(items);
}, "예약 목록 조회 오류:");

export const getBookingDetailHandler = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const booking = await getUserBookingDetail({ userId, id });
  return res.json(booking);
}, "예약 상세 조회 오류:");

export const createBookingHandler = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const idempotencyKey = req.headers["idempotency-key"];
  const { packageId, bookingDate } = req.body;

  const result = await createBooking({
    userId,
    idempotencyKey,
    packageId,
    bookingDate,
  });

  return res.status(result.statusCode).json(result.body);
}, "예약 생성 오류:");

export const cancelBookingHandler = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const idempotencyKey = req.headers["idempotency-key"];
  const { reason = null } = req.body || {};

  const result = await cancelBooking({
    userId,
    id,
    reason,
    idempotencyKey,
  });

  return res.status(result.statusCode).json(result.body);
}, "예약 취소 오류:");
