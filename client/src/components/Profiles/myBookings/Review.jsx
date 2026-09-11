import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@/utils/authStorage.js";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
};

const BookingReview = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviewable = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/review/reviewable", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "후기 가능 목록 조회 실패");
        }

        setBookings(
          data.map((item) => ({
            id: item.bookingId,
            title: item.title,
            date: formatDate(item.booking_date),
            reviewed: Boolean(item.reviewed),
          })),
        );
      } catch (err) {
        console.error("후기 가능 목록 조회 오류:", err);
        alert("후기 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewable();
  }, []);

  const handleReviewClick = (id) => {
    navigate(`/myBookings/review/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">이용 후기 작성</h2>

      {loading && <p className="text-gray-500 mb-4">불러오는 중...</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-gray-500 mb-4">작성 가능한 후기가 없습니다.</p>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
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
