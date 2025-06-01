import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const dummyUsableBookings = [
  {
    id: "BK202405001",
    title: "도쿄 2박 3일 자유여행 패키지",
    date: "2025-06-10 ~ 2025-06-12",
    reviewed: false,
  },
  {
    id: "BK202405003",
    title: "부산 1박 2일 맛집 투어",
    date: "2025-06-20 ~ 2025-06-21",
    reviewed: true,
  },
];

const BookingReview = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setBookings(dummyUsableBookings);
  }, []);

  const handleReviewClick = (id) => {
    navigate(`/myBookings/review/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-2xl shadow mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">이용 후기 작성</h2>

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
