import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createIdempotencyKey } from "@/utils/idempotency.js";
import { requestApi } from "@/utils/request.js";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";
import { useToast } from "@/components/Common/ToastProvider.jsx";
import { useConfirm } from "@/components/Common/ConfirmProvider.jsx";
import { queryKeys } from "@/utils/queryKeys.js";

const statusLabelMap = {
  confirmed: "예약 완료",
  completed: "예약 완료",
  cancelled: "취소 완료",
  pending: "예약 대기",
};

const toStatusLabel = (status) => statusLabelMap[status] || status || "상태 없음";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
};

const statusColor = {
  "예약 완료": "text-green-500",
  "취소 완료": "text-gray-400",
  "예약 대기": "text-yellow-500",
};

const itemsPerPage = 4;

const fetchBookings = async () => {
  const data = await requestApi(
    "/api/bookings",
    {},
    { requireAuth: true, errorMessage: "예약 목록 조회 실패" },
  );

  return data.map((item) => ({
    id: item.id,
    title: item.package?.title || "패키지 정보 없음",
    date: formatDate(item.booking_date),
    rawDate: item.booking_date,
    status: toStatusLabel(item.status),
    price: Number(item.package?.price || 0),
  }));
};

const cancelBooking = async (bookingId) => {
  const idempotencyKey = createIdempotencyKey(`booking-cancel-${bookingId}`);

  return requestApi(
    `/api/bookings/${bookingId}/cancel`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ reason: "user-ui-cancel" }),
    },
    { requireAuth: true, errorMessage: "예약 취소 실패" },
  );
};

const History = () => {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.bookings.list({ status: "all" }),
    queryFn: fetchBookings,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookings", "list"],
      });
      toast.success("예약이 취소되었습니다.");
    },
    onError: (err) => {
      console.error("예약 취소 오류:", err);
      toast.error(err.message || "예약 취소 중 오류가 발생했습니다.");
    },
  });

  const handleCancel = async (bookingId) => {
    const confirmed = await confirm("해당 예약을 취소하시겠습니까?", {
      title: "예약 취소 확인",
      confirmText: "취소하기",
      confirmTone: "danger",
      description: "취소 후에는 동일 조건으로 복구되지 않을 수 있습니다.",
    });
    if (!confirmed) return;

    await cancelMutation.mutateAsync(bookingId);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredBookings = useMemo(
    () => bookings.filter((b) => statusFilter === "전체" || b.status === statusFilter),
    [bookings, statusFilter],
  );

  // 날짜 정렬 함수
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const aDate = new Date(a.rawDate || a.date);
    const bDate = new Date(b.rawDate || b.date);
    return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
  });

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const paginated = sortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">예약 요약</h2>

      {isLoading && <LoadingState message="불러오는 중..." />}
      {!isLoading && isError && (
        <ErrorState message={error?.message || "예약 목록을 불러오지 못했습니다."} />
      )}
      {!isLoading && !isError && sortedBookings.length === 0 && (
        <EmptyState message="예약 내역이 없습니다." />
      )}

      {/* 필터 버튼 */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {["전체", "예약 완료", "취소 완료", "예약 대기"].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 shadow-sm ${
              statusFilter === status
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 정렬 버튼 */}
      <div className="text-right mb-6">
        <button
          onClick={handleSortChange}
          className="text-sm text-blue-600 hover:underline"
        >
          여행일 기준 {sortOrder === "asc" ? "오름차순" : "내림차순"}
        </button>
      </div>

      {/* 예약 리스트 */}
      <div className="space-y-6">
        {paginated.map((booking) => (
          <div
            key={booking.id}
            className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">예약번호: {booking.id}</span>
              <span className={`text-sm font-semibold ${statusColor[booking.status]}`}>
                {booking.status}
              </span>
            </div>
            <Link to={`/myBookings/detail/${booking.id}`} className="block hover:underline">
              <h3 className="text-lg font-semibold text-gray-800">{booking.title}</h3>
            </Link>
            <p className="text-sm text-gray-600 mt-1">여행일정: {booking.date}</p>
            <p className="text-sm text-gray-700 font-medium mt-1">
              결제금액: {booking.price.toLocaleString()}원
            </p>

            {booking.status === "예약 완료" && (
              <button
                className="mt-4 px-4 py-2 text-sm bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
                onClick={() => handleCancel(booking.id)}
              >
                예약 취소
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 페이지 */}
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-8 h-8 rounded-full font-medium text-sm ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default History;
