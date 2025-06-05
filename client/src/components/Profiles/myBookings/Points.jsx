import { useEffect, useState, useRef } from "react";

const Points = () => {
  const [point, setPoint] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponFilter, setCouponFilter] = useState("전체");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [registering, setRegistering] = useState(false);

  const [pointPage, setPointPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const modalRef = useRef(null);

  useEffect(() => {
    fetchPointData();
  }, []);

  const fetchPointData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/points", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("포인트/쿠폰 정보를 가져오지 못했습니다.");
      }

      const data = await res.json();
      setPoint(data.point);
      setPointHistory(data.history);
      setCoupons(data.coupons);
    } catch (err) {
      console.error("fetchPointData 에러:", err);
      alert("포인트 정보를 불러오는 데 실패했습니다.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCouponCode("");
  }

  // 바깥 클릭 또는 ESC 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  const handleCouponRegister = async () => {
    if (!couponCode.trim()) {
      alert("쿠폰 코드를 입력해 주세요.");
      return;
    }

    try {
      setRegistering(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/points/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "쿠폰 등록 실패");
      } else {
        alert("쿠폰이 성공적으로 등록되었습니다.");
        setCouponCode("");
        closeModal();
        fetchPointData();
      }
    } catch (err) {
      console.error("쿠폰 등록 오류:", err);
      alert("쿠폰 등록 중 오류가 발생했습니다.");
    } finally {
      setRegistering(false);
    }
  };

  const handleCodeChange = (e) => {
    const raw = e.target.value.toUpperCase();
    const onlyAlphaNum = raw.replace(/[^A-Z0-9]/g, "");
    setCouponCode(onlyAlphaNum);
  };

  const filteredCoupons =
    couponFilter === "전체"
      ? coupons
      : coupons.filter((c) => c.status === couponFilter);

  const filterTabs = ["전체", "사용 가능", "사용 완료", "기간 만료"];

  const pagedPointHistory = pointHistory.slice(
    (pointPage - 1) * ITEMS_PER_PAGE,
    pointPage * ITEMS_PER_PAGE
  );

  const pagedCoupons = filteredCoupons.slice(
    (couponPage - 1) * ITEMS_PER_PAGE,
    couponPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow mt-10 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">포인트 / 쿠폰 관리</h2>

      {/* 보유 포인트 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-gray-600 text-sm mb-1">현재 보유 포인트</p>
        <p className="text-3xl font-bold text-blue-600">
          {typeof point === "number" ? point.toLocaleString() + "P" : "로딩 중..."}
        </p>
      </div>

      {/* 포인트 내역 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">포인트 내역</h3>
        <ul className="space-y-2">
          {pagedPointHistory.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-3 border rounded-md text-sm text-gray-700"
            >
              <div>
                <p>{item.description}</p>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
              <span
                className={`font-semibold ${
                  item.amount > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {item.amount.toLocaleString()}P
              </span>
            </li>
          ))}
        </ul>
        {Math.ceil(pointHistory.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: Math.ceil(pointHistory.length / ITEMS_PER_PAGE) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPointPage(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  pointPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 쿠폰 목록 */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">보유 쿠폰</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            쿠폰 등록
          </button>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 text-sm border rounded-full ${
                couponFilter === tab
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setCouponFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 쿠폰 리스트 */}
        <ul className="space-y-2">
          {pagedCoupons.length === 0 ? (
            <p className="text-sm text-gray-400">해당 상태의 쿠폰이 없습니다.</p>
          ) : (
            pagedCoupons.map((coupon) => (
              <li
                key={coupon.id}
                className="flex justify-between items-center p-3 border rounded-md text-sm"
              >
                <div>
                  <p className="font-medium">{coupon.name}</p>
                  <p className="text-xs text-gray-400">유효기간: {coupon.expire}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    coupon.status === "사용 가능"
                      ? "bg-green-100 text-green-600"
                      : coupon.status === "사용 완료"
                      ? "bg-gray-100 text-gray-400"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {coupon.status}
                </span>
              </li>
            ))
          )}
        </ul>
        {Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center gap-2 mt-2">
            {Array.from({ length: Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE) }, (_, i) => (
              <button
                key={i}
                onClick={() => setCouponPage(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  couponPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded shadow-lg w-full max-w-sm space-y-4 relative"
          >
            {/* X 닫기 버튼 */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-black text-lg"
              aria-label="닫기"
            >
              &times;
            </button>

            <h4 className="text-lg font-semibold text-gray-800 text-center">쿠폰 코드 등록</h4>
            <input
              type="text"
              value={couponCode}
              onChange={handleCodeChange}
              onKeyDown={(e) => {
                if(e.key === "Enter") {
                  handleCouponRegister();
                }
              }}
              placeholder="영문 대문자 + 숫자"
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleCouponRegister}
                disabled={registering}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {registering ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Points;
