import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 더미 취소/환불 내역
const dummyCancelled = [
  {
    id: "BK202405002",
    title: "제주도 렌터카 포함 숙박 패키지",
    date: "2025-07-01 ~ 2025-07-04",
    status: "취소 완료",
    price: 420000,
  },
  {
    id: "BK202405004",
    title: "강릉 힐링 숙소 3박",
    date: "2025-08-03 ~ 2025-08-06",
    status: "환불 진행중",
    price: 610000,
  },
  {
    id: "BK202404009",
    title: "경주 역사 유적 탐방",
    date: "2025-05-10 ~ 2025-05-11",
    status: "취소 완료",
    price: 310000,
  },
  {
    id: "BK202403003",
    title: "속초 해수욕과 회 정식 패키지",
    date: "2025-06-01 ~ 2025-06-02",
    status: "환불 완료",
    price: 290000,
  },
  {
    id: "BK202403017",
    title: "여수 밤바다 요트 투어",
    date: "2025-07-18 ~ 2025-07-20",
    status: "환불 진행중",
    price: 440000,
  },
];

const statusColor = {
  "취소 완료": "text-gray-500",
  "환불 진행중": "text-yellow-500",
  "환불 완료": "text-green-600",
};

const itemsPerPage = 4;

const Cancel = () => {
  const [records, setRecords] = useState([]);
  const [statusFilter, setStatusFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setRecords(dummyCancelled);
  }, []);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSortChange = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filtered = records.filter(
    (r) => statusFilter === "전체" || r.status === statusFilter
  );

  // 날짜 정렬 함수
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.date.split("~")[0].trim());
    const dateB = new Date(b.date.split("~")[0].trim());
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        취소 / 환불 내역
      </h2>

      {/* 필터 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {["전체", "취소 완료", "환불 진행중", "환불 완료"].map((status) => (
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

      {/* 리스트 */}
      <div className="space-y-6">
        {paginated.map((r) => (
          <div
            key={r.id}
            className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">예약번호: {r.id}</span>
              <span className={`text-sm font-semibold ${statusColor[r.status]}`}>
                {r.status}
              </span>
            </div>
            <Link to={`/myBookings/detail/${r.id}`} className="block hover:underline">
              <h3 className="text-lg font-semibold text-gray-800">{r.title}</h3>
            </Link>
            <p className="text-sm text-gray-600 mt-1">여행일정: {r.date}</p>
            <p className="text-sm text-gray-700 font-medium mt-1">
              결제금액: {r.price.toLocaleString()}원
            </p>
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

export default Cancel;
