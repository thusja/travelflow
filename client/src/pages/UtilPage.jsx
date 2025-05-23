import React, { useState } from 'react';
import UtilSidebar from '@/components/Util/UtilSidebar';
import ExchangeCalculator from '@/components/Util/ExchangeCalculator';
import WeatherInfo from '@/components/Util/WeatherInfo';
import InsuranceGuide from '@/components/Util/InsuranceGuide';

const UtilPage = () => {
  const [section, setSection] = useState('exchange');

  const renderSection = () => {
    switch (section) {
      case 'exchange':
        return <ExchangeCalculator />;
      case 'weather':
        return <WeatherInfo />;
      case 'insurance':
        return <InsuranceGuide />;
      default:
        return <div className="text-gray-500">메뉴를 선택하세요.</div>;
    }
  };

  return (
    <div className="pt-[80px] min-h-screen bg-gray-100 flex">
      <UtilSidebar selected={section} onSelect={setSection} />
      <main className="flex-1 p-6">{renderSection()}</main>
    </div>
  );
};

export default UtilPage;
