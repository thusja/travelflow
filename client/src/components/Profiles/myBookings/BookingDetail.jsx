import { useParams, useNavigate } from "react-router-dom";

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

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const booking = dummyBookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">예약 정보를 찾을 수 없습니다.</h2>
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
