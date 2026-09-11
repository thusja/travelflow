import { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { MdDarkMode, MdLightMode, MdSettings } from "react-icons/md";
import { clearAuthStorage } from "@/utils/authStorage.js";

const AppSetting = () => {
  const [theme, setTheme] = useState("system");
  const [autoLogout, setAutoLogout] = useState("30m");
  const [language, setLanguage] = useState("ko");

  // 테마 적용
  useEffect(() => {
    const applyTheme = (mode) => {
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (mode === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 자동 로그아웃 타이머
  useEffect(() => {
    const timeoutMap = {
      "15m": 15 * 60 * 1000,
      "30m": 30 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      never: null,
    };

    let timer;
    const logout = () => {
      alert("자동 로그아웃 되었습니다.");
      clearAuthStorage();
      window.location.href = "/login";
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      const time = timeoutMap[autoLogout];
      if (time) timer = setTimeout(logout, time);
    };

    resetTimer();

    const events = ["mousemove", "keydown", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [autoLogout]);

  // 설정 초기값 불러오기
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const storedLogout = localStorage.getItem("autoLogout");
    const storedLang = localStorage.getItem("language");
    if (storedTheme) setTheme(storedTheme);
    if (storedLogout) setAutoLogout(storedLogout);
    if (storedLang) setLanguage(storedLang);
  }, []);

  // 언어 설정 저장
  useEffect(() => {
    localStorage.setItem("language", language);
    // 추후 i18n 연동 시: i18n.changeLanguage(language)
  }, [language]);

  const handleClearCache = () => {
    if (window.confirm("캐시와 임시 저장소를 초기화하시겠습니까?")) {
      clearAuthStorage();
      localStorage.removeItem("theme");
      localStorage.removeItem("autoLogout");
      localStorage.removeItem("language");
      localStorage.removeItem("recentCities");
      localStorage.removeItem("notifications");
      sessionStorage.clear();
      alert("저장소가 초기화되었습니다.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-10 space-y-8 text-gray-800">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MdSettings className="text-blue-600" />
        앱 설정
      </h2>

      {/* 테마 설정 */}
      <section className="bg-white border rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">테마 설정</h3>
        <div className="grid grid-cols-3 gap-2">
          {["system", "light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`py-2 rounded-md border text-sm font-medium flex items-center justify-center gap-1 transition
                ${
                  theme === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {t === "system" && "시스템 기본값"}
              {t === "light" && (
                <>
                  <MdLightMode />
                  밝은 테마
                </>
              )}
              {t === "dark" && (
                <>
                  <MdDarkMode />
                  어두운 테마
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 자동 로그아웃 */}
      <section className="bg-white border rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">자동 로그아웃 시간</h3>
        <select
          className="w-full border px-4 py-2 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={autoLogout}
          onChange={(e) => {
            setAutoLogout(e.target.value);
            localStorage.setItem("autoLogout", e.target.value);
          }}
        >
          <option value="15m">15분</option>
          <option value="30m">30분</option>
          <option value="1h">1시간</option>
          <option value="never">사용 안 함</option>
        </select>
      </section>

      {/* 언어 설정 */}
      <section className="bg-white border rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">언어 설정</h3>
        <select
          className="w-full border px-4 py-2 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </section>

      {/* 저장소 초기화 */}
      <section className="bg-white border rounded-lg p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm">저장 데이터 초기화</h3>
        <button
          onClick={handleClearCache}
          className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition text-sm"
        >
          <FaTrashAlt />
          캐시 및 임시 저장소 초기화
        </button>
      </section>

      {/* 앱 버전 */}
      <div className="text-center text-xs text-gray-400 pt-4">앱 버전 v1.0.0</div>
    </div>
  );
};

export default AppSetting;
