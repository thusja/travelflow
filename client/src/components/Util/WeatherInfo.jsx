import React, { useState } from 'react';

const WeatherInfo = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const handleCheckWeather = () => {
    if(!city.trim()) {
      alert("도시 이름을 입력해주세요");
      return;
    }

    // 임시 데이터
    const dummyWeather = {
      temp: 23,
      description: "맑음",
      humidity: 42,
      wind: 2.1
    };

    setWeather(dummyWeather);
  }
  


  return (
    <div className="bg-white p-6 shadow-md rounded-md max-w-xl mx-auto">
      <h3 className="text-2xl font-semibold mb-4">날씨 정보</h3>

      <div className="space-y-4">
        {/* 도시 입력 */}
        <div>
          <label className="block mb-1 font-medium">도시 이름</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="예: 서울, 도쿄, 파리"
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleCheckWeather}
            className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800"
          >
            날씨 확인
          </button>
        </div>

        {weather && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-center space-y-2">
            <p className="text-xl font-semibold text-blue-800">
              {city}의 날씨
            </p>
            <p className="text-gray-700">🌡️ 기온: {weather.temp}°C</p>
            <p className="text-gray-700">🌤️ 상태: {weather.description}</p>
            <p className="text-gray-700">💧 습도: {weather.humidity}%</p>
            <p className="text-gray-700">🌬️ 바람: {weather.wind} m/s</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherInfo;
