import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccessToken } from "@/utils/authStorage.js";
import LoadingState from "@/components/Common/LoadingState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";

const statusLabelMap = {
  confirmed: "예약 완료",
  completed: "예약 완료",
  cancelled: "취소 완료",
  pending: "예약 대기",
};

const toStatusLabel = (status) => statusLabelMap[status] || status || "알 수 없음";

const statusColor = {
  "예약 완료": "text-green-500",
  "취소 완료": "text-gray-400",
  "예약 대기": "text-yellow-500",
};

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "예약 상세 조회 실패");
        }

        setBooking({
          id: data.id,
          title: data.package?.title || "패키지 정보 없음",
          date: new Date(data.booking_date).toLocaleDateString("ko-KR"),
          status: toStatusLabel(data.status),
          price: Number(data.package?.price || 0),
        });
      } catch (err) {
        console.error("예약 상세 조회 오류:", err);
        setError("예약 정보를 불러오지 못했습니다.");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 text-center">
        <LoadingState message="예약 정보를 불러오는 중..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 text-center">
        {error ? (
          <ErrorState message={error} />
        ) : (
          <h2 className="text-2xl font-bold mb-4">예약 정보를 찾을 수 없습니다.</h2>
        )}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">예약 상세 정보</h2>
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>예약번호:</strong> {booking.id}</p>
        <p><strong>상품명:</strong> {booking.title}</p>
        <p><strong>여행일정:</strong> {booking.date}</p>
        <p><strong>상태:</strong> <span className={statusColor[booking.status]}>{booking.status}</span></p>
        <p><strong>결제금액:</strong> {booking.price.toLocaleString()}원</p>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        목록으로 돌아가기
      </button>
    </div>
  );
};

export default BookingDetail;
