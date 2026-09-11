import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { ERROR_CODES, sendError } from "../utils/apiResponse.js";
import { buildCacheKey } from "../utils/cacheKey.js";
import { getCache, getCacheMode, setCache } from "../utils/cacheStore.js";

dotenv.config();

const router = express.Router();

// 환경변수에서 API 키 가져오기
const API_KEY = process.env.EXCHANGE_API_KEY;
const BASE_URL = "https://v6.exchangerate-api.com/v6";
const EXTERNAL_CACHE_TTL_SECONDS = Number(
  process.env.CACHE_TTL_EXTERNAL_API_SECONDS || 300,
);
const WEATHER_CURRENT_TTL_SECONDS = Number(
  process.env.CACHE_TTL_WEATHER_CURRENT_SECONDS || 180,
);
const WEATHER_CITY_TTL_SECONDS = Number(
  process.env.CACHE_TTL_WEATHER_CITY_SECONDS || 180,
);

const withCache = async (key, ttlSeconds, resolver) => {
  const cached = await getCache(key);
  if (cached) {
    return {
      value: cached,
      hit: true,
    };
  }

  const value = await resolver();
  await setCache(key, value, ttlSeconds);

  return {
    value,
    hit: false,
  };
};

// 환율 정보 가져오기
export const getExchangeRates = async (base = "USD", symbols = "") => {
  const apiUrl = `${BASE_URL}/${API_KEY}/latest/${base}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result !== "success") {
      throw new Error(data["error-type"] || "API 요청 실패");
    }

    const allRates = data.conversion_rates;

    const rates = symbols
      ? symbols.split(",").reduce((obj, key) => {
          if (allRates[key]) obj[key] = allRates[key];
          return obj;
        }, {})
      : allRates;

    return { base: data.base_code, rates };
  } catch (error) {
    throw new Error("환율 정보를 가져오는 데 실패했습니다.");
  }
};

// GET /api/exchange-rates?base=USD&symbols=KRW,JPY
router.get("/exchange-rates", async (req, res) => {
  const { base, symbols } = req.query;
  const normalizedBase = base || "USD";
  const normalizedSymbols = symbols || "";
  const cacheKey = buildCacheKey("external", "exchangeRates", {
    base: normalizedBase,
    symbols: normalizedSymbols,
  });

  try {
    const { value, hit } = await withCache(
      cacheKey,
      EXTERNAL_CACHE_TTL_SECONDS,
      async () => getExchangeRates(normalizedBase, normalizedSymbols),
    );

    res.set("X-Cache", hit ? "HIT" : "MISS");
    res.json(value);
  } catch (error) {
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
    });
  }
});

// 날씨 정보 가져오기 (현재 날씨 + 7일 예보)
const WEATHER_API_KEY =
  process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = "https://api.openweathermap.org/data";

// 실시간 날씨: /api/weather/current?lat=37.56&lon=126.97
router.get("/weather/current", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon)
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "위도와 경도가 필요합니다.",
    });

  try {
    const cacheKey = buildCacheKey("external", "weatherCurrent", {
      lat,
      lon,
    });

    const { value, hit } = await withCache(
      cacheKey,
      WEATHER_CURRENT_TTL_SECONDS,
      async () => {
        const url = `${WEATHER_BASE_URL}/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) throw new Error(data.message);
        return data;
      },
    );

    res.set("X-Cache", hit ? "HIT" : "MISS");
    res.json(value);
  } catch (err) {
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: err.message,
    });
  }
});

// 도시명을 입력해 날씨 검색 확장
router.get("/weather/by-city", async (req, res) => {
  const { city } = req.query;
  if (!city)
    return sendError(res, {
      status: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "도시명을 입력해주세요.",
    });

  try {
    const normalizedCity = String(city).trim().toLowerCase();
    const cacheKey = buildCacheKey("external", "weatherByCity", {
      city: normalizedCity,
    });

    const { value, hit } = await withCache(
      cacheKey,
      WEATHER_CITY_TTL_SECONDS,
      async () => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=kr`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.status !== 200) throw new Error(data.message);
        return data;
      },
    );

    res.set("X-Cache", hit ? "HIT" : "MISS");
    res.json(value);
  } catch (error) {
    return sendError(res, {
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: error.message,
    });
  }
});

router.get("/cache/health", async (req, res) => {
  const mode = await getCacheMode();
  res.json({ mode });
});

export default router;
