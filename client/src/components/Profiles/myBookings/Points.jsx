import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingState from "@/components/Common/LoadingState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";
import { useToast } from "@/components/Common/ToastProvider.jsx";
import { createIdempotencyKey } from "@/utils/idempotency.js";
import { queryKeys } from "@/utils/queryKeys.js";
import { requestApi } from "@/utils/request.js";

const ITEMS_PER_PAGE = 4;

const Points = () => {
  const queryClient = useQueryClient();
  const modalRef = useRef(null);
  const toast = useToast();

  const [couponFilter, setCouponFilter] = useState("전체");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [pointPage, setPointPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.points.summary(),
    queryFn: () =>
      requestApi(
        "/api/points",
        {},
        { requireAuth: true, errorMessage: "포인트/쿠폰 정보를 가져오지 못했습니다." },
      ),
  });

  const registerCouponMutation = useMutation({
    mutationFn: (code) =>
      requestApi(
        "/api/points/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": createIdempotencyKey("coupon-register"),
          },
          body: JSON.stringify({ code }),
        },
        { requireAuth: true, errorMessage: "쿠폰 등록 실패" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.points.summary() });
    },
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
        setCouponCode("");
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setCouponCode("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setCouponCode("");
  };

  const handleCouponRegister = async () => {
    if (!couponCode.trim()) {
      toast.info("쿠폰 코드를 입력해 주세요.");
      return;
    }

    try {
      await registerCouponMutation.mutateAsync(couponCode);
      toast.success("쿠폰이 성공적으로 등록되었습니다.");
      closeModal();
    } catch (err) {
      console.error("쿠폰 등록 오류:", err);
      toast.error(err.message || "쿠폰 등록 중 오류가 발생했습니다.");
    }
  };

  const handleCodeChange = (e) => {
    const raw = e.target.value.toUpperCase();
    setCouponCode(raw.replace(/[^A-Z0-9]/g, ""));
  };

  if (isLoading) {
    return <LoadingState message="포인트/쿠폰 정보를 불러오는 중..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message || "포인트/쿠폰 정보를 불러오지 못했습니다."} />;
  }

  const point = data?.point ?? 0;
  const pointHistory = data?.history ?? [];
  const coupons = data?.coupons ?? [];
  const filterTabs = ["전체", "사용 가능", "사용 완료", "기간 만료"];

  const filteredCoupons =
    couponFilter === "전체"
      ? coupons
      : coupons.filter((coupon) => coupon.status === couponFilter);

  const pagedPointHistory = pointHistory.slice(
    (pointPage - 1) * ITEMS_PER_PAGE,
    pointPage * ITEMS_PER_PAGE,
  );

  const pagedCoupons = filteredCoupons.slice(
    (couponPage - 1) * ITEMS_PER_PAGE,
    couponPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow mt-10 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">포인트 / 쿠폰 관리</h2>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-gray-600 text-sm mb-1">현재 보유 포인트</p>
        <p className="text-3xl font-bold text-blue-600">{point.toLocaleString()}P</p>
      </div>

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
              <span className={`font-semibold ${item.amount > 0 ? "text-green-600" : "text-red-500"}`}>
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

        <div className="flex gap-2 mb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1 text-sm border rounded-full ${
                couponFilter === tab
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => {
                setCouponFilter(tab);
                setCouponPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded shadow-lg w-full max-w-sm space-y-4 relative"
          >
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
                if (e.key === "Enter") {
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
                disabled={registerCouponMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {registerCouponMutation.isPending ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Points;
