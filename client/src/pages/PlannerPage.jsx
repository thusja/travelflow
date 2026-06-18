import { useState } from "react";
import DatePicker from "react-datepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const PlannerPage = () => {
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
  const queryClient = useQueryClient();

  const {
    data: plans = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.planner.list({ scope: "recent" }),
    queryFn: getPlannerPlans,
  });

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
            onChange={(e) => {
              setDestination(e.target.value);
              setFormError("");
              setSubmitError("");
            }}
            maxLength={100}
            placeholder="예 : 도쿄, 파리, 제주도"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{destination.length}/100</p>
        </div>

        {/* 일정 메모 */}
        <div>
          <label className="block font-medium mb-1">일정 메모</label>
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
            className="w-full border border-gray-300 rounded-md px-4 py-2"
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{planText.length}/2000</p>
        </div>

        {/* 버튼 */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="bg-black text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-800 disabled:opacity-60"
          >
            {createMutation.isPending ? "저장 중..." : "저장하기"}
          </button>
        </div>

        {successMessage && (
          <p className="text-green-600 text-sm text-center">{successMessage}</p>
        )}
        {formError && <p className="text-red-600 text-sm text-center">{formError}</p>}
        {submitError && <p className="text-red-600 text-sm text-center">{submitError}</p>}
      </div>

      <div className="space-y-3 bg-white p-6 shadow-md rounded-md mt-6">
        <h2 className="text-xl font-semibold">최근 저장된 일정</h2>
        {isLoading ? (
          <LoadingState message="일정을 불러오는 중..." />
        ) : isError ? (
          <ErrorState message={error?.message || "일정 조회에 실패했습니다."} />
        ) : plans.length === 0 ? (
          <EmptyState message="저장된 일정이 없습니다." />
        ) : (
          <ul className="space-y-2">
            {plans.slice(0, 5).map((plan) => (
              <li key={plan.id} className="border rounded-md p-3 text-sm text-left">
                {editingPlanId === plan.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editDestination}
                      onChange={(e) => {
                        setEditDestination(e.target.value);
                        setEditFormError("");
                      }}
                      maxLength={100}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 text-right">{editDestination.length}/100</p>
                    <input
                      type="date"
                      value={editTravelDate}
                      onChange={(e) => {
                        setEditTravelDate(e.target.value);
                        setEditFormError("");
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <textarea
                      rows={4}
                      value={editMemo}
                      onChange={(e) => {
                        setEditMemo(e.target.value);
                        setEditFormError("");
                      }}
                      maxLength={2000}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 text-right">{editMemo.length}/2000</p>
                    {editFormError && <p className="text-red-600 text-xs">{editFormError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditSave}
                        disabled={updateMutation.isPending}
                        className="px-3 py-1 rounded-md bg-black text-white disabled:opacity-60"
                      >
                        {updateMutation.isPending ? "수정 중..." : "수정 저장"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={updateMutation.isPending}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-700"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-800">{plan.destination}</p>
                    <p className="text-gray-500">
                      {new Date(plan.travelDate).toLocaleDateString("ko-KR")}
                    </p>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{plan.memo}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => startEditing(plan)}
                        className="px-3 py-1 rounded-md border border-gray-300 text-gray-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-1 rounded-md border border-red-200 text-red-600 disabled:opacity-60"
                      >
                        {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlannerPage;
