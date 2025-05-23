import React from 'react';

const InsuranceGuide = () => {
  return (
    <div className="bg-white p-6 shadow-md rounded-md max-w-3xl mx-auto space-y-6">
      <h3 className='text-2xl font-semibold mb-4'>여행자 보험 가이드</h3>

      {/* 소개 */}
      <section>
        <p className='text-gray-700 leading-relaxed'>
          여행자 보험은 해외 및 국내 여행 중 발생할 수 있는 사고, 질병, 도난 등에 대비하는 중요한 안전망입니다.
          많은 국가에서 필수로 요구되기도 하며, 비상 상황에서 큰 도움이 됩니다.
        </p>
      </section>

      {/* 필요한 상황 */}
      <section>
        <h4 className="text-xl font-semibold mb-2">📌 이런 상황에서 유용해요</h4>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>비행기 지연 또는 수하물 분실</li>
          <li>여행 중 갑작스런 병원 방문 또는 입원</li>
          <li>카메라, 노트북 등 고가 물품 도난</li>
          <li>현지 사고로 인한 책임 보상</li>
        </ul>
      </section>

      {/* 가입 안내 */}
      <section>
        <h4 className="text-xl font-semibold mb-2">🧭 가입은 어떻게 하나요?</h4>
        <p className="text-gray-700 mb-2">
          대부분의 보험사는 앱 또는 웹사이트를 통해 간단히 가입할 수 있습니다. 여행 일정과 국가, 보장 범위를 입력하면 추천 플랜이 나옵니다.
        </p>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-sm text-blue-800">
          📎 준비 중: 다양한 보험사 비교 & 추천 기능이 곧 제공될 예정입니다.
        </div>
      </section>
    </div>
  );
};

export default InsuranceGuide;
