import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTravelSuggestion,
  getTravelSuggestions,
} from "@/utils/api.js";
import { queryKeys } from "@/utils/queryKeys.js";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";

const SuggestPage = () => {
  const [destination, setDestination] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const queryClient = useQueryClient();

  const {
    data: suggestions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.suggestions.list({ scope: "recent" }),
    queryFn: getTravelSuggestions,
  });

  const createMutation = useMutation({
    mutationFn: createTravelSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", "list"] });
      setSuccessMessage('소중한 제안 감사합니다!');
      setDestination('');
      setSuggestion('');
    },
  });

  const handleSubmit = async () => {
    setSuccessMessage("");
    setFormError('');
    setSubmitError('');

    const normalizedDestination = destination.trim();
    const normalizedSuggestion = suggestion.trim();

    if (!normalizedDestination || !normalizedSuggestion) {
      setFormError('모든 항목을 입력해주세요.');
      return;
    }

    if (normalizedDestination.length > 100) {
      setFormError('여행지는 100자 이하로 입력해주세요.');
      return;
    }

    if (normalizedSuggestion.length > 2000) {
      setFormError('제안 내용은 2000자 이하로 입력해주세요.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        destination: normalizedDestination,
        suggestion: normalizedSuggestion,
      });
    } catch (e) {
      setSubmitError(e.message || "제안 제출 중 오류가 발생했습니다.");
    }
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
            onChange={(e) => {
              setDestination(e.target.value);
              setFormError('');
              setSubmitError('');
            }}
            maxLength={100}
            placeholder="예: 삿포로, 치앙마이, 시칠리아"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{destination.length}/100</p>
        </div>

        {/* 제안 내용 */}
        <div>
          <label className="block font-medium mb-1">어떤 점이 좋을까요?</label>
          <textarea
            rows={5}
            value={suggestion}
            onChange={(e) => {
              setSuggestion(e.target.value);
              setFormError('');
              setSubmitError('');
            }}
            maxLength={2000}
            placeholder="이 여행지를 왜 추천하시는지 자유롭게 작성해주세요."
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{suggestion.length}/2000</p>
        </div>

        {/* 제출 버튼 */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800"
          >
            {createMutation.isPending ? "제출 중..." : "제안 제출하기"}
          </button>
        </div>

        {successMessage && (
          <p className="text-green-600 text-sm text-center">{successMessage}</p>
        )}
        {formError && <p className="text-red-600 text-sm text-center">{formError}</p>}
        {submitError && <p className="text-red-600 text-sm text-center">{submitError}</p>}
      </div>

      <div className="bg-white p-6 shadow-md rounded-md space-y-3 mt-6">
        <h2 className="text-xl font-semibold">최근 제안</h2>
        {isLoading ? (
          <LoadingState message="제안 목록을 불러오는 중..." />
        ) : isError ? (
          <ErrorState message={error?.message || "제안 목록 조회에 실패했습니다."} />
        ) : suggestions.length === 0 ? (
          <EmptyState message="등록된 제안이 없습니다." />
        ) : (
          <ul className="space-y-2">
            {suggestions.slice(0, 5).map((item) => (
              <li key={item.id} className="border rounded-md p-3 text-left">
                <p className="font-semibold text-gray-800">{item.destination}</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{item.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SuggestPage;
