import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  createPlannerPlan,
  deletePlannerPlan,
  getPlannerPlans,
  updatePlannerPlan,
} from "@/utils/api.js";
import { queryKeys } from "@/utils/queryKeys.js";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";

const PLANNER_PAGE_SIZE = 5;
const PLANNER_SEARCH_DEBOUNCE_MS = 250;
const PLANNER_QUERY_SEARCH_KEY = "q";
const PLANNER_QUERY_SORT_KEY = "sort";
const ALLOWED_PLANNER_SORTS = new Set([
  "date-desc",
  "date-asc",
  "created-desc",
  "created-asc",
]);

const normalizePlannerSort = (value) => {
  const normalized = String(value ?? "").trim();
  return ALLOWED_PLANNER_SORTS.has(normalized) ? normalized : "date-desc";
};

const normalizePlannerKeyword = (searchParams) => {
  return String(searchParams.get(PLANNER_QUERY_SEARCH_KEY) ?? "").trim();
};

const PlannerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [startDate, setStartDate] = useState(null);
  const [destination, setDestination] = useState('');
  const [planText, setPlanText] = useState('');
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [editingPlanId, setEditingPlanId] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editTravelDate, setEditTravelDate] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editFormError, setEditFormError] = useState("");
  const [searchInput, setSearchInput] = useState(() => normalizePlannerKeyword(searchParams));
  const [searchKeyword, setSearchKeyword] = useState(() => normalizePlannerKeyword(searchParams));
  const [sortOrder, setSortOrder] = useState(() => normalizePlannerSort(searchParams.get(PLANNER_QUERY_SORT_KEY)));
  const [visibleCount, setVisibleCount] = useState(PLANNER_PAGE_SIZE);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchInput);
    }, PLANNER_SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams();
    const normalizedKeyword = searchKeyword.trim();

    if (normalizedKeyword) {
      params.set(PLANNER_QUERY_SEARCH_KEY, normalizedKeyword);
    }

    if (sortOrder !== "date-desc") {
      params.set(PLANNER_QUERY_SORT_KEY, sortOrder);
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [searchKeyword, sortOrder, searchParams, setSearchParams]);

  useEffect(() => {
    const keywordFromUrl = normalizePlannerKeyword(searchParams);
    const sortFromUrl = normalizePlannerSort(searchParams.get(PLANNER_QUERY_SORT_KEY));

    if (keywordFromUrl !== searchInput) {
      setSearchInput(keywordFromUrl);
    }

    if (keywordFromUrl !== searchKeyword) {
      setSearchKeyword(keywordFromUrl);
    }

    if (sortFromUrl !== sortOrder) {
      setSortOrder(sortFromUrl);
    }
  }, [searchParams]);

  const {
    data: plans = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.planner.list({ scope: "recent" }),
    queryFn: getPlannerPlans,
  });

  useEffect(() => {
    setVisibleCount(PLANNER_PAGE_SIZE);
  }, [searchKeyword, sortOrder, plans.length]);

  const createMutation = useMutation({
    mutationFn: createPlannerPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner", "list"] });
      setSuccessMessage("일정이 저장되었습니다.");
      setStartDate(null);
      setDestination("");
      setPlanText("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ planId, payload }) => updatePlannerPlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner", "list"] });
      setSuccessMessage("일정이 수정되었습니다.");
      setEditingPlanId("");
      setEditDestination("");
      setEditTravelDate("");
      setEditMemo("");
      setEditFormError("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlannerPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner", "list"] });
      setSuccessMessage("일정이 삭제되었습니다.");
      setEditingPlanId("");
      setEditDestination("");
      setEditTravelDate("");
      setEditMemo("");
      setEditFormError("");
    },
  });

  const visiblePlans = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    const sorted = [...plans].sort((a, b) => {
      const dateATime = new Date(a.travelDate).getTime();
      const dateBTime = new Date(b.travelDate).getTime();
      const createdATime = new Date(a.createdAt).getTime();
      const createdBTime = new Date(b.createdAt).getTime();

      if (
        !Number.isFinite(dateATime) ||
        !Number.isFinite(dateBTime) ||
        !Number.isFinite(createdATime) ||
        !Number.isFinite(createdBTime)
      ) {
        return 0;
      }

      if (sortOrder === "date-asc") return dateATime - dateBTime;
      if (sortOrder === "created-desc") return createdBTime - createdATime;
      if (sortOrder === "created-asc") return createdATime - createdBTime;

      return dateBTime - dateATime;
    });

    if (!normalizedKeyword) {
      return sorted;
    }

    return sorted.filter((plan) => {
      const destination = String(plan.destination ?? "").toLowerCase();
      const memo = String(plan.memo ?? "").toLowerCase();
      return (
        destination.includes(normalizedKeyword) ||
        memo.includes(normalizedKeyword)
      );
    });
  }, [plans, searchKeyword, sortOrder]);

  const handleSave = async () => {
    setSuccessMessage("");
    setFormError("");
    setSubmitError("");

    const normalizedDestination = destination.trim();
    const normalizedMemo = planText.trim();

    if (!startDate || !normalizedDestination || !normalizedMemo) {
      setFormError("모든 항목을 입력해주세요.");
      return;
    }

    if (normalizedDestination.length > 100) {
      setFormError("여행지는 100자 이하로 입력해주세요.");
      return;
    }

    if (normalizedMemo.length > 2000) {
      setFormError("일정 메모는 2000자 이하로 입력해주세요.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        destination: normalizedDestination,
        travelDate: startDate,
        memo: normalizedMemo,
      });
    } catch (e) {
      setSubmitError(e.message || "일정 저장 중 오류가 발생했습니다.");
    }
  };

  const startEditing = (plan) => {
    setSuccessMessage("");
    setSubmitError("");
    setEditFormError("");
    setEditingPlanId(plan.id);
    setEditDestination(plan.destination);
    setEditTravelDate(new Date(plan.travelDate).toISOString().slice(0, 10));
    setEditMemo(plan.memo);
  };

  const cancelEditing = () => {
    setEditingPlanId("");
    setEditDestination("");
    setEditTravelDate("");
    setEditMemo("");
    setEditFormError("");
  };

  const handleEditSave = async () => {
    setSuccessMessage("");
    setSubmitError("");
    setEditFormError("");

    const normalizedDestination = editDestination.trim();
    const normalizedMemo = editMemo.trim();

    if (!editingPlanId || !normalizedDestination || !editTravelDate || !normalizedMemo) {
      setEditFormError("모든 항목을 입력해주세요.");
      return;
    }

    if (normalizedDestination.length > 100) {
      setEditFormError("여행지는 100자 이하로 입력해주세요.");
      return;
    }

    if (normalizedMemo.length > 2000) {
      setEditFormError("일정 메모는 2000자 이하로 입력해주세요.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        planId: editingPlanId,
        payload: {
          destination: normalizedDestination,
          travelDate: editTravelDate,
          memo: normalizedMemo,
        },
      });
    } catch (e) {
      setEditFormError(e.message || "일정 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (planId) => {
    setSuccessMessage("");
    setSubmitError("");
    setEditFormError("");

    if (!window.confirm("해당 일정을 삭제하시겠어요?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(planId);
    } catch (e) {
      setSubmitError(e.message || "일정 삭제 중 오류가 발생했습니다.");
    }
  };

  const plannerSortSummaryLabel = {
    "date-desc": "여행일 최신순",
    "date-asc": "여행일 오래된순",
    "created-desc": "등록 최신순",
    "created-asc": "등록 오래된순",
  }[sortOrder] || "여행일 최신순";

  return (
    <div className="planner-suggest-shell min-h-screen">
      <h1 className="planner-suggest-title">여행 일정 플래너</h1>
      <p className="planner-suggest-subtitle">나만의 일정 흐름을 기록하고 바로 수정해보세요.</p>

      <div className="planner-suggest-card planner-suggest-card--primary">
        {/* 날짜 선택 */}
        <div className="planner-suggest-field">
          <label className="planner-suggest-label">여행 날짜</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="날짜를 선택하세요"
            className="planner-suggest-date"
          />
        </div>

        {/* 여행지 */}
        <div className="planner-suggest-field">
          <label className="planner-suggest-label">여행지</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setFormError("");
              setSubmitError("");
            }}
            maxLength={100}
            placeholder="예 : 도쿄, 파리, 제주도"
            className="planner-suggest-input"
          />
          <p className="planner-suggest-counter">{destination.length}/100</p>
        </div>

        {/* 일정 메모 */}
        <div className="planner-suggest-field">
          <label className="planner-suggest-label">일정 메모</label>
          <textarea
            rows={5}
            value={planText}
            onChange={(e) => {
              setPlanText(e.target.value);
              setFormError("");
              setSubmitError("");
            }}
            maxLength={2000}
            placeholder="여기에 간단한 일정을 작성하세요"
            className="planner-suggest-textarea"
          />
          <p className="planner-suggest-counter">{planText.length}/2000</p>
        </div>

        {/* 버튼 */}
        <div className="planner-suggest-actions">
          <button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="planner-suggest-btn planner-suggest-btn--primary"
          >
            {createMutation.isPending ? "저장 중..." : "저장하기"}
          </button>
        </div>

        {successMessage && (
          <p className="planner-suggest-feedback planner-suggest-feedback--success">{successMessage}</p>
        )}
        {formError && <p className="planner-suggest-feedback planner-suggest-feedback--error">{formError}</p>}
        {submitError && <p className="planner-suggest-feedback planner-suggest-feedback--error">{submitError}</p>}
      </div>

      <div className="planner-suggest-card">
        <h2 className="text-lg font-bold">최근 저장된 일정</h2>
        <div className="planner-suggest-field">
          <label className="planner-suggest-label">일정 검색</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="여행지 또는 메모로 검색"
            className="planner-suggest-input"
          />
        </div>
        <div className="planner-suggest-filter-row planner-suggest-sort-row">
          {[
            { key: "date-desc", label: "여행일 최신순" },
            { key: "date-asc", label: "여행일 오래된순" },
            { key: "created-desc", label: "등록 최신순" },
            { key: "created-asc", label: "등록 오래된순" },
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => setSortOrder(sort.key)}
              className={`planner-suggest-filter-chip ${sortOrder === sort.key ? "planner-suggest-filter-chip--active" : ""}`}
            >
              {sort.label}
            </button>
          ))}
        </div>
        <div className="planner-suggest-filter-row">
          <span className="planner-suggest-filter-chip planner-suggest-filter-chip--active">
            정렬: {plannerSortSummaryLabel}
          </span>
          {searchKeyword.trim() ? (
            <span className="planner-suggest-filter-chip planner-suggest-filter-chip--active">
              검색: {searchKeyword.trim()}
            </span>
          ) : null}
        </div>
        {isLoading ? (
          <LoadingState message="일정을 불러오는 중..." />
        ) : isError ? (
          <ErrorState message={error?.message || "일정 조회에 실패했습니다."} />
        ) : plans.length === 0 ? (
          <EmptyState message="저장된 일정이 없습니다." />
        ) : visiblePlans.length === 0 ? (
          <EmptyState message="검색 결과가 없습니다." />
        ) : (
          <ul className="planner-suggest-list">
            {visiblePlans.slice(0, visibleCount).map((plan) => (
              <li key={plan.id} className="planner-suggest-item">
                {editingPlanId === plan.id ? (
                  <div className="space-y-2 text-sm">
                    <input
                      type="text"
                      value={editDestination}
                      onChange={(e) => {
                        setEditDestination(e.target.value);
                        setEditFormError("");
                      }}
                      maxLength={100}
                      className="planner-suggest-input"
                    />
                    <p className="planner-suggest-counter">{editDestination.length}/100</p>
                    <input
                      type="date"
                      value={editTravelDate}
                      onChange={(e) => {
                        setEditTravelDate(e.target.value);
                        setEditFormError("");
                      }}
                      className="planner-suggest-date"
                    />
                    <textarea
                      rows={4}
                      value={editMemo}
                      onChange={(e) => {
                        setEditMemo(e.target.value);
                        setEditFormError("");
                      }}
                      maxLength={2000}
                      className="planner-suggest-textarea"
                    />
                    <p className="planner-suggest-counter">{editMemo.length}/2000</p>
                    {editFormError && (
                      <p className="planner-suggest-feedback planner-suggest-feedback--error">{editFormError}</p>
                    )}
                    <div className="planner-suggest-actions justify-start">
                      <button
                        onClick={handleEditSave}
                        disabled={updateMutation.isPending}
                        className="planner-suggest-btn planner-suggest-btn--primary"
                      >
                        {updateMutation.isPending ? "수정 중..." : "수정 저장"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={updateMutation.isPending}
                        className="planner-suggest-btn planner-suggest-btn--ghost"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="planner-suggest-item-title">{plan.destination}</p>
                    <p className="planner-suggest-item-date">
                      {new Date(plan.travelDate).toLocaleDateString("ko-KR")}
                    </p>
                    <p className="planner-suggest-item-content">{plan.memo}</p>
                    <div className="planner-suggest-actions justify-start">
                      <button
                        onClick={() => startEditing(plan)}
                        className="planner-suggest-btn planner-suggest-btn--ghost"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleteMutation.isPending}
                        className="planner-suggest-btn planner-suggest-btn--danger"
                      >
                        {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}

            {visiblePlans.length > visibleCount && (
              <li className="planner-suggest-item">
                <div className="planner-suggest-actions justify-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PLANNER_PAGE_SIZE)}
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

export default PlannerPage;
