import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";
import {
  createReview,
  deleteReview,
  getReviewableBookings,
} from "../services/reviewService.js";

export const createReviewHandler = withErrorHandling(async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const userId = req.user.id;
  const imageUrl = req.file ? `/uploads/reviews/${req.file.filename}` : null;

  await createReview({ userId, bookingId, rating, comment, imageUrl });
  return res.status(201).json({ message: "후기가 등록되었습니다." });
}, "후기 등록 오류:");

export const getReviewableHandler = withErrorHandling(async (req, res) => {
  const userId = req.user.id;
  const { filter = "", sort } = req.query;
  const { page, size, skip, take } = parsePageSize(req.query);

  const sortInfo = parseSort(sort, ["bookingDate", "title"], {
    key: "bookingDate",
    direction: "desc",
  });

  const { total, items } = await getReviewableBookings({
    userId,
    filter,
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
}, "리뷰 가능 예약 조회 오류:");

export const deleteReviewHandler = withErrorHandling(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  await deleteReview({ id, userId });
  return res.json({ message: "후기가 삭제되었습니다." });
}, "후기 삭제 오류:");
