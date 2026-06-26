import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  createTravelSuggestion,
  deleteTravelSuggestion,
  getTravelSuggestions,
  updateTravelSuggestionStatus,
} from "@/utils/api.js";
import { queryKeys } from "@/utils/queryKeys.js";
import {
  applySearchParamsIfChanged,
  buildQueryParams,
  normalizeEnumParam,
  normalizeEnumQueryParam,
  normalizeSelectedStatusesFromQuery,
} from "@/utils/queryParamFilters.js";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";
import useSyncedDebouncedQueryValue from "@/hooks/useSyncedDebouncedQueryValue.js";

const ALLOWED_FILTERS = new Set(['all', 'received', 'reviewed']);
const ALLOWED_SORTS = new Set(['latest', 'oldest']);
const DELETE_UNDO_WINDOW_MS = 5000;
const DEFAULT_SELECTED_STATUSES = ['received', 'reviewed'];
const SUGGESTIONS_PAGE_SIZE = 5;
const SEARCH_QUERY_PARAM = 'q';

const SuggestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destination, setDestination] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [manageMessage, setManageMessage] = useState('');
  const [manageError, setManageError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [visibleCount, setVisibleCount] = useState(SUGGESTIONS_PAGE_SIZE);
  const deleteCommitTimerRef = useRef(null);

  const queryClient = useQueryClient();
  const {
    inputValue: searchInput,
    setInputValue: setSearchInput,
    debouncedValue: searchKeyword,
  } = useSyncedDebouncedQueryValue({
    searchParams,
    queryKey: SEARCH_QUERY_PARAM,
    debounceMs: 250,
  });
  const selectedStatuses = normalizeSelectedStatusesFromQuery({
    searchParams,
    allowedSet: ALLOWED_FILTERS,
    defaultStatuses: DEFAULT_SELECTED_STATUSES,
  });
  const sortOrder = normalizeEnumQueryParam(
    searchParams,
    'sort',
    ALLOWED_SORTS,
    'latest',
  );

  const {
    data: allSuggestions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.suggestions.list({ scope: "recent", sort: sortOrder }),
    queryFn: () => getTravelSuggestions({ status: "all", sort: sortOrder }),
  });

  const suggestionsByStatus = useMemo(() => {
    const selectedSet = new Set(selectedStatuses);
    return allSuggestions.filter((item) => selectedSet.has(item.status));
  }, [allSuggestions, selectedStatuses]);

  const suggestions = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return suggestionsByStatus;
    }

    return suggestionsByStatus.filter((item) => {
      const destination = String(item.destination ?? '').toLowerCase();
      const content = String(item.content ?? '').toLowerCase();
      return destination.includes(normalizedKeyword) || content.includes(normalizedKeyword);
    });
  }, [suggestionsByStatus, searchKeyword]);

  const filterCounts = useMemo(() => {
    return allSuggestions.reduce(
      (acc, item) => {
        acc.all += 1;
        if (item.status === 'reviewed') {
          acc.reviewed += 1;
        } else {
          acc.received += 1;
        }
        return acc;
      },
      { all: 0, received: 0, reviewed: 0 },
    );
  }, [allSuggestions]);

  useEffect(() => {
    setManageMessage('');
    setManageError('');
  }, [selectedStatuses.join(','), sortOrder]);

  useEffect(() => {
    updateQueryParams(selectedStatuses, sortOrder, searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    setVisibleCount(SUGGESTIONS_PAGE_SIZE);
  }, [selectedStatuses.join(','), sortOrder, allSuggestions.length]);

  useEffect(() => {
    return () => {
      if (deleteCommitTimerRef.current) {
        clearTimeout(deleteCommitTimerRef.current);
      }
    };
  }, []);

  const updateQueryParams = (nextStatuses, nextSort, nextKeyword = searchKeyword) => {
    const normalizedStatuses = [...new Set(nextStatuses)]
      .filter((value) => value !== 'all' && ALLOWED_FILTERS.has(value));

    const params = buildQueryParams({
      statuses:
        normalizedStatuses.length > 0 &&
        normalizedStatuses.length < DEFAULT_SELECTED_STATUSES.length
          ? normalizedStatuses.join(',')
          : undefined,
      sort: nextSort !== 'latest' ? nextSort : undefined,
      [SEARCH_QUERY_PARAM]: nextKeyword.trim() || undefined,
    });

    applySearchParamsIfChanged(searchParams, setSearchParams, params);
  };

  const toggleStatusFilter = (nextFilter) => {
    const normalized = normalizeEnumParam(nextFilter, ALLOWED_FILTERS, 'all');

    if (normalized === 'all') {
      updateQueryParams(DEFAULT_SELECTED_STATUSES, sortOrder);
      return;
    }

    const exists = selectedStatuses.includes(normalized);
    const nextStatuses = exists
      ? selectedStatuses.filter((value) => value !== normalized)
      : [...selectedStatuses, normalized];

    updateQueryParams(nextStatuses.length > 0 ? nextStatuses : DEFAULT_SELECTED_STATUSES, sortOrder);
  };

  const setSortOrder = (nextSort) => {
    const normalized = normalizeEnumParam(nextSort, ALLOWED_SORTS, 'latest');
    updateQueryParams(selectedStatuses, normalized);
  };

  const clearMessages = () => {
    setManageMessage('');
    setManageError('');
  };

  const restoreSuggestionQueries = (previous) => {
    if (!previous) {
      return;
    }

    previous.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

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
    onMutate: async ({ suggestionId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["suggestions", "list"] });

      const previous = queryClient.getQueriesData({ queryKey: ["suggestions", "list"] });

      queryClient.setQueriesData({ queryKey: ["suggestions", "list"] }, (old) => {
        if (!Array.isArray(old)) {
          return old;
        }

        return old.map((item) => {
          if (item.id !== suggestionId) {
            return item;
          }

          return {
            ...item,
            status,
          };
        });
      });

      return { previous };
    },
    onSuccess: (_, variables) => {
      setManageError('');
      setManageMessage(
        variables.status === 'reviewed'
          ? '제안을 검토 완료로 변경했습니다.'
          : '제안을 접수 상태로 되돌렸습니다.',
      );
    },
    onError: (_error, _variables, context) => {
      if (!context?.previous) {
        return;
      }

      context.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", "list"] });
    },
  });

  const deleteSuggestionMutation = useMutation({
    mutationFn: ({ suggestionId }) => deleteTravelSuggestion(suggestionId),
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
    clearMessages();
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

  const handleDeleteSuggestion = async (item) => {
    clearMessages();
    setSubmitError('');

    if (pendingDelete) {
      setManageError('삭제 대기 중인 제안이 있습니다. 먼저 취소하거나 잠시 기다려주세요.');
      return;
    }

    if (!window.confirm('이 제안을 삭제하시겠어요?')) {
      return;
    }

    try {
      await queryClient.cancelQueries({ queryKey: ["suggestions", "list"] });

      const previous = queryClient.getQueriesData({ queryKey: ["suggestions", "list"] });

      queryClient.setQueriesData({ queryKey: ["suggestions", "list"] }, (old) => {
        if (!Array.isArray(old)) {
          return old;
        }

        return old.filter((currentItem) => currentItem.id !== item.id);
      });

      setPendingDelete({
        suggestionId: item.id,
        destination: item.destination,
        previous,
      });
      setManageError('');
      setManageMessage(`"${item.destination}" 제안을 삭제 대기 상태로 전환했습니다. 5초 내 취소할 수 있어요.`);

      deleteCommitTimerRef.current = setTimeout(async () => {
        try {
          await deleteSuggestionMutation.mutateAsync({ suggestionId: item.id });
          setManageError('');
          setManageMessage(`"${item.destination}" 제안을 삭제했습니다.`);
        } catch (e) {
          restoreSuggestionQueries(previous);
          setManageError(e.message || '제안 삭제 중 오류가 발생했습니다.');
        } finally {
          setPendingDelete((current) => (current?.suggestionId === item.id ? null : current));
          deleteCommitTimerRef.current = null;
          queryClient.invalidateQueries({ queryKey: ["suggestions", "list"] });
        }
      }, DELETE_UNDO_WINDOW_MS);
    } catch (e) {
      setManageError(e.message || '제안 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleUndoDelete = () => {
    if (!pendingDelete) {
      return;
    }

    if (deleteCommitTimerRef.current) {
      clearTimeout(deleteCommitTimerRef.current);
      deleteCommitTimerRef.current = null;
    }

    restoreSuggestionQueries(pendingDelete.previous);
    setManageError('');
    setManageMessage(`"${pendingDelete.destination}" 제안 삭제를 취소했습니다.`);
    setPendingDelete(null);
  };

  const getStatusLabel = (status) => (status === 'reviewed' ? '검토 완료' : '접수됨');

  const getStatusClasses = (status) => {
    return status === 'reviewed'
      ? 'planner-suggest-status bg-green-100 text-green-700 border border-green-200'
      : 'planner-suggest-status bg-amber-100 text-amber-700 border border-amber-200';
  };

  const isItemStatusPending = (suggestionId) => {
    return (
      updateStatusMutation.isPending &&
      updateStatusMutation.variables?.suggestionId === suggestionId
    );
  };

  const isItemDeletePending = (suggestionId) => {
    return (
      pendingDelete?.suggestionId === suggestionId ||
      deleteSuggestionMutation.isPending &&
      deleteSuggestionMutation.variables?.suggestionId === suggestionId
    );
  };

  const getStatusCount = (status) => {
    if (status === 'all') return filterCounts.all;
    if (status === 'received') return filterCounts.received;
    return filterCounts.reviewed;
  };

  const statusSummaryLabel = (() => {
    if (selectedStatuses.length === DEFAULT_SELECTED_STATUSES.length) {
      return '전체';
    }

    return selectedStatuses
      .map((status) => (status === 'reviewed' ? '검토 완료' : '접수됨'))
      .join(', ');
  })();

  const sortSummaryLabel = sortOrder === 'latest' ? '최신순' : '오래된순';

  return (
    <div className="planner-suggest-shell min-h-screen">
      <h1 className="planner-suggest-title">여행 제안하기</h1>
      <p className="planner-suggest-subtitle">좋은 여행 아이디어를 공유하고 처리 상태를 관리하세요.</p>

      <div className="planner-suggest-card planner-suggest-card--primary">
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
          {['all', 'received', 'reviewed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                clearMessages();
                toggleStatusFilter(status);
              }}
              className={`planner-suggest-filter-chip ${
                status === 'all'
                  ? selectedStatuses.length === DEFAULT_SELECTED_STATUSES.length
                  : selectedStatuses.includes(status)
                    ? 'planner-suggest-filter-chip--active'
                    : ''
              }`}
            >
              {status === 'all' ? '전체' : status === 'received' ? '접수됨' : '검토 완료'}
              {' '}
              <span className="planner-suggest-filter-count">{getStatusCount(status)}</span>
            </button>
          ))}
        </div>

        <div className="planner-suggest-filter-row planner-suggest-sort-row">
          {['latest', 'oldest'].map((sort) => (
            <button
              key={sort}
              onClick={() => {
                clearMessages();
                setSortOrder(sort);
              }}
              className={`planner-suggest-filter-chip ${sortOrder === sort ? 'planner-suggest-filter-chip--active' : ''}`}
            >
              {sort === 'latest' ? '최신순' : '오래된순'}
            </button>
          ))}
        </div>

        <div className="planner-suggest-field">
          <label className="planner-suggest-label">제안 검색</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="여행지 또는 제안 내용으로 검색"
            className="planner-suggest-input"
          />
        </div>

        <div className="planner-suggest-filter-row">
          <span className="planner-suggest-filter-chip planner-suggest-filter-chip--active">
            상태: {statusSummaryLabel}
          </span>
          <span className="planner-suggest-filter-chip planner-suggest-filter-chip--active">
            정렬: {sortSummaryLabel}
          </span>
          {searchKeyword.trim() ? (
            <span className="planner-suggest-filter-chip planner-suggest-filter-chip--active">
              검색: {searchKeyword.trim()}
            </span>
          ) : null}
        </div>

        {manageMessage && <p className="planner-suggest-feedback planner-suggest-feedback--success">{manageMessage}</p>}
        {pendingDelete && (
          <div className="planner-suggest-actions justify-start">
            <button
              onClick={handleUndoDelete}
              className="planner-suggest-btn planner-suggest-btn--ghost"
            >
              삭제 취소
            </button>
          </div>
        )}
        {manageError && <p className="planner-suggest-feedback planner-suggest-feedback--error">{manageError}</p>}
        {isLoading ? (
          <LoadingState message="제안 목록을 불러오는 중..." />
        ) : isError ? (
          <ErrorState message={error?.message || "제안 목록 조회에 실패했습니다."} />
        ) : suggestions.length === 0 ? (
          <EmptyState message={searchKeyword.trim() ? "검색 결과가 없습니다." : "등록된 제안이 없습니다."} />
        ) : (
          <ul className="planner-suggest-list">
            {suggestions.slice(0, visibleCount).map((item) => {
              const isStatusPending = isItemStatusPending(item.id);
              const isDeletePending = isItemDeletePending(item.id);

              return (
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
                      disabled={isStatusPending || isDeletePending}
                      className="planner-suggest-btn planner-suggest-btn--ghost"
                    >
                      {isStatusPending
                        ? '상태 변경 중...'
                        : item.status === 'reviewed'
                          ? '접수 상태로 되돌리기'
                          : '검토 완료로 변경'}
                    </button>
                    <button
                      onClick={() => handleDeleteSuggestion(item)}
                      disabled={isDeletePending || isStatusPending}
                      className="planner-suggest-btn planner-suggest-btn--danger"
                    >
                      {isDeletePending ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                </li>
              );
            })}

            {suggestions.length > visibleCount && (
              <li className="planner-suggest-item">
                <div className="planner-suggest-actions justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + SUGGESTIONS_PAGE_SIZE)}
                    className="planner-suggest-btn planner-suggest-btn--ghost"
                  >
                    더보기
                  </button>
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SuggestPage;
