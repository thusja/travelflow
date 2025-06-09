import { useEffect, useState } from "react";

const WeatherInfo = () => {
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentCities, setRecentCities] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const cityList = ["Seoul", "Busan", "Tokyo", "Osaka", "Paris", "London", "New York", "Beijing", "Sydney"];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentCities")) || [];
    setRecentCities(saved);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        setLoading(true);
        const res = await fetch(`/api/weather/current?lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setWeather({
          city: data.name,
          temp: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          wind: data.wind.speed,
        });
      } catch (err) {
        console.error("자동 위치 날씨 로딩 실패:", err.message);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const handleSearch = async () => {
    if (!cityInput.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/weather/by-city?city=${encodeURIComponent(cityInput)}`);
      const data = await res.json();
      if (res.ok) {
        setWeather({
          city: data.name,
          temp: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          wind: data.wind.speed,
        });
        const updated = [data.name, ...recentCities.filter((c) => c !== data.name)].slice(0, 5);
        setRecentCities(updated);
        localStorage.setItem("recentCities", JSON.stringify(updated));
      } else {
        alert("도시 정보를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("도시 검색 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = cityList.filter((c) =>
      c.toLowerCase().includes(cityInput.toLowerCase())
    );
    setSuggestions(cityInput ? filtered : []);
  }, [cityInput]);

  return (
    <div className="relative w-full bg-white px-8 py-12 shadow-lg rounded-2xl max-w-6xl mx-auto">
      {/* 제목 */}
      <h3 className="absolute -top-10 left-1/2 -translate-x-1/2 text-3xl font-bold bg-white px-4 py-2 rounded-xl shadow">날씨 정보</h3>

      {/* 입력창 + 버튼 */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4 mb-6 mt-6">
        <div className="relative w-full sm:w-[400px]">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="도시 이름 입력 (예: Seoul, Tokyo, Paris)"
            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm sm:text-base"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full rounded shadow mt-1">
              {suggestions.map((city, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setCityInput(city);
                    setSuggestions([]);
                  }}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-black text-white px-5 py-2 rounded-md font-semibold hover:bg-gray-800"
        >
          도시 검색
        </button>
      </div>

      {/* 최근 검색 도시 */}
      {recentCities.length > 0 && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-600 mb-2 text-center sm:text-left">최근 검색 도시</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {recentCities.map((city, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCityInput(city);
                  setTimeout(handleSearch, 100);
                }}
                className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 날씨 박스 */}
      {loading && (
        <p className="text-center text-sm text-gray-500 mt-4">불러오는 중...</p>
      )}

      {weather && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center space-y-2">
          <p className="text-xl font-semibold text-blue-800">
            📍 <span className="font-bold">{weather.city}</span>의 현재 날씨
          </p>
          <p className="text-gray-700 text-lg">🌡️ 기온: {weather.temp.toFixed(1)}°C</p>
          <p className="text-gray-700 text-lg">🌤️ 상태: {weather.description}</p>
          <p className="text-gray-700 text-lg">💧 습도: {weather.humidity}%</p>
          <p className="text-gray-700 text-lg">🌬️ 바람: {weather.wind} m/s</p>
        </div>
      )}
    </div>
  );
};

export default WeatherInfo;
