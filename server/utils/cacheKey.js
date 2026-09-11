const normalizeParams = (params) => {
  if (!params || typeof params !== "object") {
    return "all";
  }

  const entries = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return "all";
  }

  return entries
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("|");
};

export const buildCacheKey = (domain, resource, params = {}) => {
  const domainPart = domain || "app";
  const resourcePart = resource || "default";
  const paramPart =
    typeof params === "string" ? params || "all" : normalizeParams(params);

  return `${domainPart}:${resourcePart}:${paramPart}`;
};
