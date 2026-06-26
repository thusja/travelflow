export const normalizeTrimmedParam = (searchParams, key) => {
  return String(searchParams.get(key) ?? "").trim();
};

export const normalizeEnumParam = (value, allowedSet, fallback) => {
  const normalized = String(value ?? "").trim();
  return allowedSet.has(normalized) ? normalized : fallback;
};

export const normalizeEnumQueryParam = (
  searchParams,
  key,
  allowedSet,
  fallback,
) => {
  return normalizeEnumParam(searchParams.get(key), allowedSet, fallback);
};

export const normalizeCsvEnumQueryParam = (searchParams, key, allowedSet) => {
  return String(searchParams.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value && allowedSet.has(value));
};

export const buildQueryParams = (paramsRecord = {}) => {
  const nextParams = new URLSearchParams();

  Object.entries(paramsRecord).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const normalized = String(value).trim();
    if (!normalized) {
      return;
    }

    nextParams.set(key, normalized);
  });

  return nextParams;
};

export const applySearchParamsIfChanged = (
  searchParams,
  setSearchParams,
  nextParams,
) => {
  if (nextParams.toString() === searchParams.toString()) {
    return;
  }

  setSearchParams(nextParams);
};

export const normalizeSelectedStatusesFromQuery = ({
  searchParams,
  allowedSet,
  defaultStatuses = [],
  statusesKey = "statuses",
  statusKey = "status",
}) => {
  const fromStatusesParam = normalizeCsvEnumQueryParam(
    searchParams,
    statusesKey,
    allowedSet,
  ).filter((value) => value !== "all");

  if (fromStatusesParam.length > 0) {
    return [...new Set(fromStatusesParam)];
  }

  const fromStatusParam = normalizeEnumQueryParam(
    searchParams,
    statusKey,
    allowedSet,
    "all",
  );

  if (fromStatusParam !== "all") {
    return [fromStatusParam];
  }

  return [...defaultStatuses];
};
