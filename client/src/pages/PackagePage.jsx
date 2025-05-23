import React, { useState, useEffect } from 'react';
import PackageList from '@/components/Package/PackageList';
import PackageDetail from '@/components/Package/PackageDetail';
import { getPackages } from "@/utils/api.js";

const PackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPackages()
      .then(setPackages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50 px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">예약 가능한 패키지</h1>

      {loading ? (
        <p className="text-center text-gray-500">불러오는 중...</p>
      ) : !selected ? (
        <PackageList packages={packages} onSelect={setSelected} />
      ) : (
        <PackageDetail data={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
};

export default PackagePage;
