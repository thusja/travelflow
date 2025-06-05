import { useState } from 'react';

const SuggestPage = () => {
  const [destination, setDestination] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = () => {
    if (!destination || !suggestion) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    console.log({
      제안여행지: destination,
      제안내용: suggestion,
    });

    setSuccessMessage('소중한 제안 감사합니다! 🙏');
    setDestination('');
    setSuggestion('');
  };

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50 px-4 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10">여행 제안하기</h1>

      <div className="bg-white p-6 shadow-md rounded-md space-y-6">
        {/* 여행지 입력 */}
        <div>
          <label className="block font-medium mb-1">여행지 이름</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="예: 삿포로, 치앙마이, 시칠리아"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>

        {/* 제안 내용 */}
        <div>
          <label className="block font-medium mb-1">어떤 점이 좋을까요?</label>
          <textarea
            rows={5}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="이 여행지를 왜 추천하시는지 자유롭게 작성해주세요."
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800"
          >
            제안 제출하기
          </button>
        </div>

        {successMessage && (
          <p className="text-green-600 text-sm text-center">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default SuggestPage;
