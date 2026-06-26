import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTravelSuggestion,
  getTravelSuggestions,
  updateTravelSuggestionStatus,
} from "@/utils/api.js";
import { queryKeys } from "@/utils/queryKeys.js";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";

const SuggestPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [destination, setDestination] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [manageMessage, setManageMessage] = useState('');
  const [manageError, setManageError] = useState('');
  const queryClient = useQueryClient();

  const {
    data: suggestions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.suggestions.list({ scope: "recent", status: statusFilter }),
    queryFn: () => getTravelSuggestions({ status: statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: createTravelSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", "list"] });
      setSuccessMessage('소중한 제안 감사합니다!');
      setDestination('');
      setSuggestion('');
      setManageError('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ suggestionId, status }) => updateTravelSuggestionStatus(suggestionId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", "list"] });
      setManageError('');
      setManageMessage(
        variables.status === 'reviewed'
          ? '제안을 검토 완료로 변경했습니다.'
          : '제안을 접수 상태로 되돌렸습니다.',
      );
    },
  });

  const handleSubmit = async () => {
    setSuccessMessage("");
    setManageMessage('');
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

  const handleToggleStatus = async (item) => {
    setManageError('');
    setManageMessage('');
    setSubmitError('');

    const nextStatus = item.status === 'reviewed' ? 'received' : 'reviewed';

    try {
      await updateStatusMutation.mutateAsync({
        suggestionId: item.id,
        status: nextStatus,
      });
    } catch (e) {
      setManageError(e.message || '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const getStatusLabel = (status) => (status === 'reviewed' ? '검토 완료' : '접수됨');

  const getStatusClasses = (status) => {
    return status === 'reviewed'
      ? 'planner-suggest-status bg-green-100 text-green-700 border border-green-200'
      : 'planner-suggest-status bg-amber-100 text-amber-700 border border-amber-200';
  };

  return (
    <div className="planner-suggest-shell min-h-screen">
      <h1 className="planner-suggest-title">여행 제안하기</h1>
      <p className="planner-suggest-subtitle">좋은 여행 아이디어를 공유하고 처리 상태를 관리하세요.</p>

      <div className="planner-suggest-card planner-suggest-card--primary">
        {/* 여행지 입력 */}
        <div className="planner-suggest-field">
          <label className="planner-suggest-label">여행지 이름</label>
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
            className="planner-suggest-input"
          />
          <p className="planner-suggest-counter">{destination.length}/100</p>
        </div>

        {/* 제안 내용 */}
        <div className="planner-suggest-field">
          <label className="planner-suggest-label">어떤 점이 좋을까요?</label>
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
            className="planner-suggest-textarea"
          />
          <p className="planner-suggest-counter">{suggestion.length}/2000</p>
        </div>

        {/* 제출 버튼 */}
        <div className="planner-suggest-actions">
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="planner-suggest-btn planner-suggest-btn--primary"
          >
            {createMutation.isPending ? "제출 중..." : "제안 제출하기"}
          </button>
        </div>

        {successMessage && (
          <p className="planner-suggest-feedback planner-suggest-feedback--success">{successMessage}</p>
        )}
        {formError && <p className="planner-suggest-feedback planner-suggest-feedback--error">{formError}</p>}
        {submitError && <p className="planner-suggest-feedback planner-suggest-feedback--error">{submitError}</p>}
      </div>

      <div className="planner-suggest-card">
        <h2 className="text-lg font-bold">최근 제안 / 관리</h2>
        <div className="planner-suggest-filter-row">
          <button
            onClick={() => setStatusFilter('all')}
            className={`planner-suggest-filter-chip ${statusFilter === 'all' ? 'planner-suggest-filter-chip--active' : ''}`}
          >
            전체
          </button>
          <button
            onClick={() => setStatusFilter('received')}
            className={`planner-suggest-filter-chip ${statusFilter === 'received' ? 'planner-suggest-filter-chip--active' : ''}`}
          >
            접수됨
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`planner-suggest-filter-chip ${statusFilter === 'reviewed' ? 'planner-suggest-filter-chip--active' : ''}`}
          >
            검토 완료
          </button>
        </div>
        {manageMessage && <p className="planner-suggest-feedback planner-suggest-feedback--success">{manageMessage}</p>}
        {manageError && <p className="planner-suggest-feedback planner-suggest-feedback--error">{manageError}</p>}
        {isLoading ? (
          <LoadingState message="제안 목록을 불러오는 중..." />
        ) : isError ? (
          <ErrorState message={error?.message || "제안 목록 조회에 실패했습니다."} />
        ) : suggestions.length === 0 ? (
          <EmptyState message="등록된 제안이 없습니다." />
        ) : (
          <ul className="planner-suggest-list">
            {suggestions.slice(0, 5).map((item) => (
              <li key={item.id} className="planner-suggest-item">
                <div className="flex items-center justify-between gap-2">
                  <p className="planner-suggest-item-title">{item.destination}</p>
                  <span className={getStatusClasses(item.status)}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <p className="planner-suggest-item-date">
                  {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="planner-suggest-item-content">{item.content}</p>
                <div className="planner-suggest-actions justify-start">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    disabled={updateStatusMutation.isPending}
                    className="planner-suggest-btn planner-suggest-btn--ghost"
                  >
                    {updateStatusMutation.isPending
                      ? '상태 변경 중...'
                      : item.status === 'reviewed'
                        ? '접수 상태로 되돌리기'
                        : '검토 완료로 변경'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SuggestPage;
