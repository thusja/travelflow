import React, { useState } from 'react';

const exchangeRates = {
  USD: 0.00075,
  EUR: 0.00069,
  JPY: 0.11,
  CNY: 0.0052
}

const ExchangeCalculator = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState("USD");
  const [converted, setConverted] = useState(null);

  const handleConvert = () => {
    const krw = parseFloat(amount);
    if (isNaN(krw) || krw <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }
    const rate = exchangeRates[currency];
    setConverted((krw * rate).toFixed(2));
  }

  return (
    <div className="bg-white p-6 shadow-md rounded-md max-w-xl mx-auto">
      <h3 className='text-2xl font-semibold mb-4'>환율 계산기</h3>

      <div className='space-y-4'>
        {/* 금액 입력  */}
        <div>
          <label className="block mb-1 font-medium">금액 (₩)</label>
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='금액을 입력하세요'
            className='w-full border border-gray-300 px-4 py-2 rounded-md'
          />
        </div>

        {/* 통화 선택 */}
        <div>
          <label className="block mb-1 font-medium">변환 통화</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          >
            {Object.keys(exchangeRates).map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>

        {/* 변환 결과 */}
        <div className="text-center">
          <button
            onClick={handleConvert}
            className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800"
          >
            변환하기
          </button>
        </div>

        {converted !== null && (
          <div className="text-center mt-4 text-xl font-bold text-blue-600">
            ≈ {converted} {currency}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeCalculator;
