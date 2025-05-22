import React, { useState } from "react";
import DatePicker from "react-datepicker";

const PlannerPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [destination, setDestination] = useState('');
  const [planText, setPlanText] = useState('');

  const handleSave = () => {
    alert("일정은 나중에 저장 기능과 연결됩니다");
    console.log({
      여행일자: startDate,
      여행지: destination,
      메모: planText,
    });
  };

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50 px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10">여행 일정 플래너</h1>

      <div className="space-y-6 bg-white p-6 shadow-md rounded-md">
        {/* 날짜 선택 */}
        <div>
          <label className="block font-medium mb-1">여행 날짜</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="날짜를 선택하세요"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>

        {/* 여행지 */}
        <div>
          <label className="block font-medium mb-1">여행지</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="예 : 도쿄, 파리, 제주도"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>

        {/* 일정 메모 */}
        <div>
          <label className="block font-medium mb-1">일정 메모</label>
          <textarea
            rows={5}
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            placeholder="여기에 간단한 일정을 작성하세요"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>

        {/* 버튼 */}
        <div className="text-center">
          <button onClick={handleSave} className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800">
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
