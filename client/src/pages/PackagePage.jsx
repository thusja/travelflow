import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PackageList from '@/components/Package/PackageList';
import PackageDetail from '@/components/Package/PackageDetail';
import { getPackages } from "@/utils/api.js";
import LoadingState from '@/components/Common/LoadingState.jsx';
import EmptyState from '@/components/Common/EmptyState.jsx';
import ErrorState from '@/components/Common/ErrorState.jsx';
import { queryKeys } from '@/utils/queryKeys.js';

const PackagePage = () => {
  const [selected, setSelected] = useState(null);
  const {
    data: packages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.packages.list({ source: "package-page" }),
    queryFn: getPackages,
  });

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50 px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">예약 가능한 패키지</h1>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message="패키지 목록 조회에 실패했습니다." />
      ) : !selected && packages.length === 0 ? (
        <EmptyState message="등록된 패키지가 없습니다." />
      ) : !selected ? (
        <PackageList packages={packages} onSelect={setSelected} />
      ) : (
        <PackageDetail data={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
};

export default PackagePage;
