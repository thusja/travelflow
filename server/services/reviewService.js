import { v4 as uuidv4 } from "uuid";
import prisma from "../db/index.js";
import { ERROR_CODES } from "../utils/apiResponse.js";
import { throwServiceError } from "./serviceError.js";

export const createReview = async ({ userId, bookingId, rating, comment, imageUrl }) => {
  const existing = await prisma.review.findFirst({
    where: { bookingId, userId },
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
      bookingId,
      rating: Number(rating),
      comment,
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
  const review = await prisma.review.findFirst({
    where: {
      id,
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
    where: { id },
    data: {
      isDeleted: true,
      updatedAt: new Date(),
    },
  });
};
