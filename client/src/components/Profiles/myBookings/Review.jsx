import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";
import { queryKeys } from "@/utils/queryKeys.js";
import { requestApi } from "@/utils/request.js";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
};

const BookingReview = () => {
  const navigate = useNavigate();

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.reviews.reviewable(),
    queryFn: () =>
      requestApi(
        "/api/review/reviewable",
        {},
        { requireAuth: true, errorMessage: "후기 가능 목록 조회 실패" },
      ),
  });

  const bookings = useMemo(
    () =>
      data.map((item) => ({
        id: item.bookingId,
        title: item.title,
        date: formatDate(item.booking_date),
        reviewed: Boolean(item.reviewed),
      })),
    [data],
  );

  const handleReviewClick = (id) => {
    navigate(`/myBookings/review/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">이용 후기 작성</h2>

      {isLoading && <LoadingState message="후기 목록을 불러오는 중..." />}
      {!isLoading && isError && (
        <ErrorState message={error?.message || "후기 목록을 불러오지 못했습니다."} />
      )}
      {!isLoading && !isError && bookings.length === 0 && (
        <EmptyState message="작성 가능한 후기가 없습니다." />
      )}

      <div className="space-y-4">
        {!isLoading && !isError && bookings.map((b) => (
          <div
            key={b.id}
            className="p-4 border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-500">예약번호: {b.id}</p>
              <p className="font-semibold text-gray-800">{b.title}</p>
              <p className="text-sm text-gray-600">여행일정: {b.date}</p>
            </div>
            <div>
              {b.reviewed ? (
                <span className="text-sm text-gray-400">작성 완료</span>
              ) : (
                <button
                  onClick={() => handleReviewClick(b.id)}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  후기 작성
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingReview;
