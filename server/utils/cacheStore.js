import { createClient } from "redis";

const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_DEFAULT_TTL_SECONDS || 60);

let redisClient = null;
let redisReady = false;
let redisInitTried = false;

const memoryStore = new Map();

const now = () => Date.now();

const getRedisUrl = () => process.env.REDIS_URL || "";

const getMemoryValue = (key) => {
  const hit = memoryStore.get(key);
  if (!hit) {
    return null;
  }

  if (hit.expiresAt <= now()) {
    memoryStore.delete(key);
    return null;
  }

  return hit.value;
};

const setMemoryValue = (key, value, ttlSeconds) => {
  const ttl = Number.isFinite(ttlSeconds) ? ttlSeconds : DEFAULT_TTL_SECONDS;
  memoryStore.set(key, {
    value,
    expiresAt: now() + Math.max(1, ttl) * 1000,
  });
};

const ensureRedisClient = async () => {
  if (redisReady || redisInitTried) {
    return redisReady;
  }

  redisInitTried = true;
  const url = getRedisUrl();

  if (!url) {
    console.warn("[cache] REDIS_URL not set; fallback to in-memory cache");
    return false;
  }

  try {
    redisClient = createClient({
      url,
      socket: {
        connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 1500),
      },
    });

    redisClient.on("error", (error) => {
      redisReady = false;
      console.warn(
        "[cache] redis connection error; fallback to in-memory cache",
      );
      if (error?.message) {
        console.warn(`[cache] ${error.message}`);
      }
    });

    await redisClient.connect();
    redisReady = true;
    console.log("[cache] redis connected");
    return true;
  } catch (error) {
    redisReady = false;
    console.warn("[cache] redis connect failed; fallback to in-memory cache");
    if (error?.message) {
      console.warn(`[cache] ${error.message}`);
    }
    return false;
  }
};

export const getCache = async (key) => {
  const hasRedis = await ensureRedisClient();

  if (hasRedis && redisClient) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      redisReady = false;
    }
  }

  return getMemoryValue(key);
};

export const setCache = async (
  key,
  value,
  ttlSeconds = DEFAULT_TTL_SECONDS,
) => {
  const hasRedis = await ensureRedisClient();
  const ttl = Number.isFinite(ttlSeconds) ? ttlSeconds : DEFAULT_TTL_SECONDS;

  if (hasRedis && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: Math.max(1, ttl),
      });
      return;
    } catch {
      redisReady = false;
    }
  }

  setMemoryValue(key, value, ttl);
};

const invalidateMemoryByPrefixes = (prefixes) => {
  for (const key of memoryStore.keys()) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      memoryStore.delete(key);
    }
  }
};

const invalidateRedisByPrefixes = async (prefixes) => {
  if (!redisClient) {
    return;
  }

  for (const prefix of prefixes) {
    const keys = [];
    for await (const key of redisClient.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
};

export const invalidateCacheByPrefixes = async (prefixes = []) => {
  const normalized = prefixes
    .filter((prefix) => typeof prefix === "string" && prefix.trim())
    .map((prefix) => prefix.trim());

  if (normalized.length === 0) {
    return;
  }

  const hasRedis = await ensureRedisClient();

  if (hasRedis && redisClient) {
    try {
      await invalidateRedisByPrefixes(normalized);
    } catch {
      redisReady = false;
    }
  }

  invalidateMemoryByPrefixes(normalized);
};

export const getCacheMode = async () => {
  const hasRedis = await ensureRedisClient();
  return hasRedis ? "redis" : "memory";
};
