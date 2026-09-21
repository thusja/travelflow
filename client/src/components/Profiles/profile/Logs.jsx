import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingState from "@/components/Common/LoadingState.jsx";
import EmptyState from "@/components/Common/EmptyState.jsx";
import ErrorState from "@/components/Common/ErrorState.jsx";
import { queryKeys } from "@/utils/queryKeys.js";
import { requestApi } from "@/utils/request.js";

const Logs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const itemsPerPage = 10;

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.users.logs(),
    queryFn: () =>
      requestApi(
        "/api/users/logs",
        {},
        { requireAuth: true, errorMessage: "로그인 기록 불러오기 실패" },
      ),
  });

  // 기간별 필터링
  const filteredLogs = useMemo(() => {
    if (selectedPeriod === "all") {
      return logs;
    }

    const now = new Date();
    let startDate;

    switch (selectedPeriod) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "1week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "15days":
        startDate = new Date(now.setDate(now.getDate() - 15));
        break;
      case "1month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3months":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        startDate = null;
    }

    return logs.filter((log) => {
      const createdAt = new Date(log.created_at);
      return startDate ? createdAt >= startDate : true;
    });
  }, [logs, selectedPeriod]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod]);

  const formatKoreanDateTime = (timestamp) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
  };

  // 페이지 계산
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  const currentIp = logs[0]?.ip || "";
  const previousIp = logs[1]?.ip || "";

  if (isLoading) {
    return <LoadingState message="로그인 기록을 불러오는 중..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message || "로그인 기록 불러오기에 실패했습니다."} />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6 bg-white rounded-xl shadow text-gray-800">
      <h2 className="text-2xl font-bold mb-8 text-center">로그인 기록</h2>

      {/* 상단 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-100 border border-blue-300 rounded-xl p-6 text-center">
          <h3 className="text-sm text-blue-800 font-semibold mb-2">최근 로그인 IP</h3>
          <p className="text-xl font-bold">{previousIp || "없음"}</p>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-xl p-6 text-center">
          <h3 className="text-sm text-red-800 font-semibold mb-2">현재 로그인 IP</h3>
          <p className="text-xl font-bold">{currentIp || "없음"}</p>
        </div>
      </div>

      {/* 드롭다운 기간 선택 */}
      <div className="mb-6 text-end">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="all">기간선택</option>
          <option value="today">오늘</option>
          <option value="1week">1주일</option>
          <option value="15days">15일</option>
          <option value="1month">1개월</option>
          <option value="3months">3개월</option>
        </select>
      </div>

      {/* 로그인 기록 테이블 */}
      {currentLogs.length === 0 ? (
        <EmptyState message="선택한 기간의 로그인 기록이 없습니다." />
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-left border-t">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="px-4 py-2 w-48">로그인 일시</th>
              <th className="px-4 py-2 min-w-[140px]">로그인 IP</th>
              <th className="px-4 py-2">기기</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="px-4 py-2">{formatKoreanDateTime(log.created_at)}</td>
                <td className="px-4 py-2 break-words">{log.ip}</td>
                <td className="px-4 py-2 text-xs text-gray-500 break-words">{log.user_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* 안내문 */}
      <div className="mt-6 text-sm text-gray-500 text-left leading-relaxed">
        - 최근 3개월 이내 기록만 확인하실 수 있습니다.
        <br />
        - 의심스러운 로그인이 보이면 보안 설정을 이용해 계정을 보호하세요.
      </div>
    </div>
  );
};

export default Logs;
