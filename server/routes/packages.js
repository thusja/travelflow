import { Router } from "express";
import prisma from "../db/index.js";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";
import {
  createListMeta,
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";

const router = Router();

const toPackageResponse = (pkg) => ({
  id: pkg.id,
  title: pkg.title,
  description: pkg.description || "",
  shortDescription: pkg.description || "",
  price:
    pkg.price === null || pkg.price === undefined ? null : Number(pkg.price),
  thumbnail: pkg.imageUrl,
  imageUrl: pkg.imageUrl,
  details: pkg.description ? [pkg.description] : [],
});

router.get("/", async (req, res) => {
  const { filter = "", sort } = req.query;
  const { page, size, skip, take } = parsePageSize(req.query);
  const sortInfo = parseSort(sort, ["id", "title", "price"], {
    key: "id",
    direction: "asc",
  });

  try {
    const where =
      filter && typeof filter === "string"
        ? {
            OR: [
              { title: { contains: filter, mode: "insensitive" } },
              { description: { contains: filter, mode: "insensitive" } },
            ],
          }
        : undefined;

    const orderBy = { [sortInfo.key]: sortInfo.direction };

    const [total, rows] = await Promise.all([
      prisma.package.count({ where }),
      prisma.package.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
    ]);

    const items = rows.map(toPackageResponse);

    if (hasListQuery(req.query)) {
      return res.json({
        items,
        meta: createListMeta({ page, size, total }),
      });
    }

    return res.json(items);
  } catch (error) {
    console.error("패키지 목록 조회 실패:", error);
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "패키지 목록 조회에 실패했습니다.",
    });
  }
});

export default router;
