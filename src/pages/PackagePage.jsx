import React, { useState } from 'react';
import PackageList from '@/components/Package/PackageList';
import PackageDetail from '@/components/Package/PackageDetail';

// 임시 패키지 데이터
const dummyPackages = [
  {
    id: 1,
    title: '도쿄 3박 4일 자유여행',
    shortDescription: '혼자 또는 친구들과 가볍게 떠나는 일본 여행!',
    description: '일본 도쿄를 중심으로 한 자유여행 패키지입니다.',
    details: ['신주쿠 호텔 3박', 'JR 패스 포함', '가이드 앱 제공'],
  },
  {
    id: 2,
    title: '제주도 2박 3일 렌트 패키지',
    shortDescription: '제주도 렌트카 + 숙소 + 맛집 쿠폰 패키지!',
    description: '제주도의 아름다운 자연을 즐기는 알찬 여행 패키지.',
    details: ['렌트카 포함', '호텔 2박', '맛집 쿠폰 증정'],
  },
];

const PackagePage = () => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50 px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">예약 가능한 패키지</h1>

      {!selected ? (
        <PackageList packages={dummyPackages} onSelect={setSelected} />
      ) : (
        <PackageDetail data={selected} onBack={() => setSelected(null)} />
      )}
    </div>
  );
};

export default PackagePage;
