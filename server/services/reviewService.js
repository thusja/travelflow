import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";
import { requireTrimmedString } from "./validationService.js";

const MAX_REVIEW_COMMENT_LENGTH = 2000;

export const createReview = async ({ userId, bookingId, rating, comment, imageUrl }) => {
  const normalizedBookingId = requireTrimmedString(bookingId, "bookingId");
  const normalizedComment = requireTrimmedString(comment, "comment");
  const normalizedRating = Number(rating);

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "rating은 1부터 5 사이의 숫자여야 합니다.",
    });
  }

  if (normalizedComment.length > MAX_REVIEW_COMMENT_LENGTH) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `comment는 ${MAX_REVIEW_COMMENT_LENGTH}자 이하여야 합니다.`,
    });
  }

  const booking = await prisma.booking.findFirst({
    where: { id: normalizedBookingId, userId },
    select: { id: true, status: true },
  });

  if (!booking) {
    throwServiceError({
      status: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: "예약을 찾을 수 없습니다.",
    });
  }

  if (booking.status !== "completed") {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "완료된 예약에만 후기를 작성할 수 있습니다.",
    });
  }

  const existing = await prisma.review.findFirst({
    where: { bookingId: normalizedBookingId, userId },
    select: { id: true },
  });

  if (existing) {
    throwServiceError({
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "이미 작성된 후기입니다.",
    });
  }

  await prisma.review.create({
    data: {
      id: uuidv4(),
      userId,
      bookingId: normalizedBookingId,
      rating: normalizedRating,
      comment: normalizedComment,
      imageUrl,
    },
  });
};

export const getReviewableBookings = async ({ userId, filter, sortInfo, skip, take }) => {
  const orderBy =
    sortInfo.key === "title"
      ? { pkg: { title: sortInfo.direction } }
      : { bookingDate: sortInfo.direction };

  const where = {
    userId,
    status: "completed",
    ...(filter && typeof filter === "string"
      ? {
          pkg: {
            title: {
              contains: filter,
              mode: "insensitive",
            },
          },
        }
      : {}),
  };

  const total = await prisma.booking.count({ where });
  const rows = await prisma.booking.findMany({
    where,
    orderBy,
    skip,
    take,
    select: {
      id: true,
      bookingDate: true,
      pkg: {
        select: {
          title: true,
        },
      },
      reviews: {
        where: {
          userId,
        },
        select: { id: true },
        take: 1,
      },
    },
  });

  const items = rows.map((row) => ({
    bookingId: row.id,
    title: row.pkg.title,
    booking_date: row.bookingDate,
    reviewId: row.reviews[0]?.id ?? null,
    reviewed: !!row.reviews[0]?.id,
  }));

  return { total, items };
};

export const deleteReview = async ({ id, userId }) => {
  const normalizedId = requireTrimmedString(id, "id");

  const review = await prisma.review.findFirst({
    where: {
      id: normalizedId,
      userId,
    },
    select: { id: true },
  });

  if (!review) {
    throwServiceError({
      status: 404,
      code: ERROR_CODES.RESOURCE_NOT_FOUND,
      message: "후기를 찾을 수 없습니다.",
    });
  }

  await prisma.review.update({
    where: { id: normalizedId },
    data: {
      isDeleted: true,
      updatedAt: new Date(),
    },
  });
};
