import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 환경변수에서 API 키 가져오기
const API_KEY = process.env.EXCHANGE_API_KEY;
const BASE_URL = "https://v6.exchangerate-api.com/v6";

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

  try {
    const data = await getExchangeRates(base || "USD", symbols || "");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
