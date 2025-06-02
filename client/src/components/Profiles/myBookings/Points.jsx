import React from "react";

const Points = () => {
  const dummyPoint = 12340;

  const pointHistory = [
    { id: 1, date: "2025-06-01", description: "예약 결제 적립", amount: +1000 },
    { id: 2, date: "2025-06-02", description: "후기 작성 보너스", amount: +300 },
    { id: 3, date: "2025-06-03", description: "예약 취소 차감", amount: -500 },
  ];

  const coupons = [
    { id: 1, name: "여름 프로모션 10% 할인", status: "사용 가능", expire: "2025-07-31" },
    { id: 2, name: "웰컴 쿠폰 5,000원", status: "사용 완료", expire: "2025-05-10" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow mt-10 space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">포인트 / 쿠폰 관리</h2>

      {/* 보유 포인트 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-gray-600 text-sm mb-1">현재 보유 포인트</p>
        <p className="text-3xl font-bold text-blue-600">{dummyPoint.toLocaleString()}P</p>
      </div>

      {/* 포인트 내역 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">포인트 내역</h3>
        <ul className="space-y-2">
          {pointHistory.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-3 border rounded-md text-sm text-gray-700"
            >
              <div>
                <p>{item.description}</p>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
              <span
                className={`font-semibold ${
                  item.amount > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {item.amount.toLocaleString()}P
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 쿠폰 목록 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">보유 쿠폰</h3>
        <ul className="space-y-2">
          {coupons.map((coupon) => (
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
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {coupon.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Points;
