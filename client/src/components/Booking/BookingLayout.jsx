import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import 'react-datepicker/dist/react-datepicker.css';
import ko from 'date-fns/locale/ko';
import { getAccessToken } from '@/utils/authStorage.js';

const BookingLayout = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/bookings/catalog");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "예약 카탈로그 조회 실패");
        }

        setPackages(data);
        if (data.length > 0) {
          setSelectedPackageId(data[0].id);
        }
      } catch (err) {
        console.error("예약 카탈로그 조회 오류:", err);
      }
    };

    fetchCatalog();
  }, []);

  const handleBooking = async () => {
    setError('');
    setSuccess('');

    const token = getAccessToken();
    if (!token) {
      setError("로그인 후 예약할 수 있습니다.");
      return;
    }

    if (!selectedPackageId) {
      setError("예약할 패키지를 선택해주세요.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError('체크인과 체크아웃 날짜를 모두 선택해주세요.');
      return;
    }

    if (dayjs(checkIn).isAfter(dayjs(checkOut))) {
      setError('체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.');
      return;
    }

    try {
      setSubmitting(true);
      const idempotencyKey = `booking-ui-${Date.now()}`;
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          packageId: selectedPackageId,
          bookingDate: dayjs(checkIn).format("YYYY-MM-DD"),
          adults,
          children,
          checkoutDate: dayjs(checkOut).format("YYYY-MM-DD"),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "예약 생성 실패");
      }

      setSuccess('예약이 완료되었습니다!');
      setCheckIn(null);
      setCheckOut(null);
      setAdults(1);
      setChildren(0);
    } catch (err) {
      console.error("예약 생성 오류:", err);
      setError(err.message || "예약 생성 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
        예약 페이지 (Booking Page)
      </h1>

      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">

        {/* 패키지 선택 */}
        <div>
          <label className="block text-sm font-medium mb-1">패키지 선택</label>
          <select
            value={selectedPackageId}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {packages.length === 0 ? (
              <option value="">선택 가능한 패키지가 없습니다</option>
            ) : (
              packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} ({Number(pkg.price || 0).toLocaleString()}원)
                </option>
              ))
            )}
          </select>
        </div>

        {/* 날짜 선택 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">체크인 날짜</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (checkOut && dayjs(date).isAfter(dayjs(checkOut))) {
                  setCheckOut(null); // reset checkout if invalid
                }
              }}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              placeholderText="날짜를 선택하세요"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">체크아웃 날짜</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              locale={ko}
              dateFormat="yyyy-MM-dd"
              placeholderText="날짜를 선택하세요"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* 인원 수 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">어른</label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}명</option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">아이</label>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {[...Array(11)].map((_, i) => (
                <option key={i} value={i}>{i}명</option>
              ))}
            </select>
          </div>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleBooking}
          disabled={submitting}
          className="w-full bg-black text-white py-2 rounded-md font-semibold hover:scale-105 transition"
        >
          {submitting ? "예약 처리 중..." : "예약하기"}
        </button>

        {/* 메시지 */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center">{success}</p>}
      </div>
    </div>
  );
};

export default BookingLayout;
