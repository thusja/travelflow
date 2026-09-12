import { withErrorHandling } from "../utils/controllerHandler.js";
import {
  hasListQuery,
  parsePageSize,
  parseSort,
} from "../utils/listQuery.js";
import { getPackages } from "../services/packageService.js";

export const getPackagesHandler = withErrorHandling(async (req, res) => {
  const { filter = "", sort } = req.query;
  const { page, size, skip, take } = parsePageSize(req.query);
  const hasList = hasListQuery(req.query);
  const sortInfo = parseSort(sort, ["id", "title", "price"], {
    key: "id",
    direction: "asc",
  });

  const { payload, cacheStatus } = await getPackages({
    filter,
    sort,
    page,
    size,
    skip,
    take,
    hasList,
    sortInfo,
  });

  res.set("X-Cache", cacheStatus);
  return res.json(payload);
}, "패키지 목록 조회 실패:");
