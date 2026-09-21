import prisma from "../db/index.js";
import { buildCacheKey } from "../utils/cacheKey.js";
import { getCache, setCache } from "../utils/cacheStore.js";
import { normalizeOptionalTrimmedString } from "./validationService.js";

const PACKAGES_CACHE_TTL_SECONDS = Number(
  process.env.CACHE_TTL_PACKAGES_SECONDS || 120,
);
const MAX_PACKAGE_FILTER_LENGTH = 100;

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

export const getPackages = async ({ filter, sort, page, size, skip, take, hasList, sortInfo }) => {
  const normalizedFilter = normalizeOptionalTrimmedString(
    filter,
    "filter",
    MAX_PACKAGE_FILTER_LENGTH,
  );

  const cacheKey = buildCacheKey("catalog", "packages", {
    filter: normalizedFilter,
    sort: sort || "",
    page,
    size,
    list: hasList ? "1" : "0",
  });

  const cached = await getCache(cacheKey);
  if (cached) {
    return {
      payload: cached,
      cacheStatus: "HIT",
    };
  }

  const where =
    normalizedFilter
      ? {
          OR: [
            { title: { contains: normalizedFilter, mode: "insensitive" } },
            { description: { contains: normalizedFilter, mode: "insensitive" } },
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

  if (hasList) {
    const payload = {
      items,
      meta: {
        page,
        size,
        total,
        totalPages: Math.max(1, Math.ceil(total / size)),
      },
    };

    await setCache(cacheKey, payload, PACKAGES_CACHE_TTL_SECONDS);

    return {
      payload,
      cacheStatus: "MISS",
    };
  }

  await setCache(cacheKey, items, PACKAGES_CACHE_TTL_SECONDS);

  return {
    payload: items,
    cacheStatus: "MISS",
  };
};
