import { useEffect, useState } from "react";
import CurrencyCard from "./CurrencyCard";

const ExchangeCalculator = () => {
  const [countries, setCountries] = useState([]);
  const [base, setBase] = useState("USD");
  const [target, setTarget] = useState("KRW");
  const [amount, setAmount] = useState(1);
  const [rates, setRates] = useState({});
  const [converted, setConverted] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      const res = await fetch("https://restcountries.com/v3.1/all");
      const data = await res.json();

      const filtered = data
        .filter((c) => c.currencies)
        .map((c) => {
          const currencyCode = Object.keys(c.currencies)[0];
          return {
            name: c.name.common,
            currency: currencyCode,
            flag: c.flags.svg,
          };
        });

      const unique = filtered.filter(
        (c, i, arr) =>
          arr.findIndex((x) => x.currency === c.currency) === i
      );

      setCountries(unique);
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(
          `/api/exchange-rates?base=${base}&symbols=${target},KRW,JPY,EUR,CNY,GBP`
        );

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error("API 응답이 JSON이 아닙니다");
        }

        const data = await res.json();
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error("환율 API 오류:", err.message);
      }
    };

    if (base && target) fetchRates();
  }, [base, target]);

  useEffect(() => {
    if (rates[target]) {
      setConverted((amount * rates[target]).toFixed(2));
    }
  }, [amount, rates, target]);

  const handleSwap = () => {
    setBase(target);
    setTarget(base);
  };

  const getFlag = (currency) =>
    countries.find((c) => c.currency === currency)?.flag;

  const getName = (currency) =>
    countries.find((c) => c.currency === currency)?.name;

  return (
    <div className="max-w-4xl mx-auto mt-16 p-10 rounded-2xl shadow-xl bg-white space-y-10">
      {/* 기준 통화 */}
      <div className="flex justify-between items-center border border-gray-300 rounded-xl px-6 py-5">
        <div className="flex items-center space-x-4">
          <img src={getFlag(base)} alt={base} className="w-8 h-5 rounded-sm" />
          <select
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="bg-transparent font-medium text-base outline-none"
          >
            {countries.map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="text-right w-32 font-semibold text-xl outline-none"
          />
          <div className="text-sm text-gray-500 mt-1">1 {base}</div>
        </div>
      </div>

      {/* ⇅ 전환 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="text-gray-600 hover:text-black text-2xl"
        >
          ⇅
        </button>
      </div>

      {/* 대상 통화 */}
      <div className="flex justify-between items-center border border-gray-300 rounded-xl px-6 py-5 bg-gray-50">
        <div className="flex items-center space-x-4">
          <img src={getFlag(target)} alt={target} className="w-8 h-5 rounded-sm" />
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-transparent font-medium text-base outline-none"
          >
            {countries.map((c) => (
              <option key={c.currency} value={c.currency}>
                {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-black">
            {converted ? Number(converted).toLocaleString() : "-"}
          </div>
          <div className="text-sm text-gray-500 mt-1">{target}</div>
        </div>
      </div>

      {/* 기준 시간 */}
      <div className="text-right text-sm text-gray-500">
        기준 시간: {lastUpdated}
      </div>

      {/* 주요 통화 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 pt-8 border-t">
        {["KRW", "JPY", "EUR", "CNY", "GBP"].map((code) => {
          const country = countries.find((c) => c.currency === code);
          const rate = rates[code];
          if (!country || !rate) return null;

          const history = Array.from({ length: 10 }, (_, i) =>
            Number((rate * (1 + Math.sin(i / 2) * 0.01)).toFixed(2))
          );
          const change = Number((history.at(-1) - history.at(-2)).toFixed(2));
          const percent = Number(((change / history.at(-2)) * 100).toFixed(2));

          return (
            <CurrencyCard
              key={code}
              name={country.name}
              code={code}
              rate={rate}
              change={change}
              percent={percent}
              history={history}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExchangeCalculator;
