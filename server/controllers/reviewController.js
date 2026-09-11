import { sendError } from "../utils/apiResponse.js";
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
import { toErrorPayload } from "../services/serviceError.js";

export const createReviewHandler = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    await createReview({ userId, bookingId, rating, comment, imageUrl });
    return res.status(201).json({ message: "후기가 등록되었습니다." });
  } catch (err) {
    console.error(err);
    return sendError(res, toErrorPayload(err));
  }
};

export const getReviewableHandler = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    return sendError(res, toErrorPayload(err));
  }
};

export const deleteReviewHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await deleteReview({ id, userId });
    return res.json({ message: "후기가 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    return sendError(res, toErrorPayload(err));
  }
};
