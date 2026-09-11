const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

export const parsePageSize = (query) => {
  const page = toPositiveInt(query.page, DEFAULT_PAGE);
  const size = Math.min(toPositiveInt(query.size, DEFAULT_SIZE), MAX_SIZE);
  const skip = (page - 1) * size;

  return { page, size, skip, take: size };
};

export const parseSort = (sort, allowedKeys, fallback) => {
  if (!sort || typeof sort !== "string") {
    return fallback;
  }

  const trimmed = sort.trim();

  if (trimmed.startsWith("-")) {
    const key = trimmed.slice(1);
    if (!allowedKeys.includes(key)) {
      return fallback;
    }
    return { key, direction: "desc" };
  }

  const [key, directionRaw] = trimmed.split(":");
  if (!allowedKeys.includes(key)) {
    return fallback;
  }

  const direction = directionRaw === "asc" ? "asc" : "desc";
  return { key, direction };
};

export const hasListQuery = (query) => {
  return ["page", "size", "sort", "filter"].some(
    (key) => query[key] !== undefined,
  );
};

export const createListMeta = ({ page, size, total }) => ({
  page,
  size,
  total,
  totalPages: Math.max(1, Math.ceil(total / size)),
});
