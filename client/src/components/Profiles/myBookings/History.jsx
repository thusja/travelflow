import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 상세 페이지 링크용

const dummyBookings = [
  {
    id: "BK202405001",
    title: "도쿄 2박 3일 자유여행 패키지",
    date: "2025-06-10 ~ 2025-06-12",
    status: "예약 완료",
    price: 550000,
  },
  {
    id: "BK202405002",
    title: "제주도 렌터카 포함 숙박 패키지",
    date: "2025-07-01 ~ 2025-07-04",
    status: "취소 완료",
    price: 420000,
  },
  {
    id: "BK202405003",
    title: "부산 1박 2일 맛집 투어",
    date: "2025-06-20 ~ 2025-06-21",
    status: "예약 완료",
    price: 330000,
  },
  {
    id: "BK202405004",
    title: "강릉 힐링 숙소 3박",
    date: "2025-08-03 ~ 2025-08-06",
    status: "환불 진행중",
    price: 610000,
  },
];

const statusColor = {
  "예약 완료": "text-green-500",
  "취소 완료": "text-gray-400",
  "환불 진행중": "text-yellow-500",
};

const itemsPerPage = 4;

const History = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setBookings(dummyBookings);
  }, []);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredBookings = bookings.filter(
    (b) => statusFilter === "전체" || b.status === statusFilter
  );

  // 날짜 정렬 함수
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const aDate = new Date(a.date.split("~")[0].trim());
    const bDate = new Date(b.date.split("~")[0].trim());
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

      {/* 필터 버튼 */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {["전체", "예약 완료", "취소 완료", "환불 진행중"].map((status) => (
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
                onClick={() => alert(`예약 취소 요청: ${booking.id}`)}
              >
                예약 취소
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 페이징 */}
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
