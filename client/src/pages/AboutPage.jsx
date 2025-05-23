import React, { useState } from 'react';
import AboutSidebar from '@/components/About/AboutSidebar';
import CompanyInfo from '@/components/About/CompanyInfo';
import CustomerService from '@/components/About/CustomerService';

const AboutPage = () => {
  const [section, setSection] = useState('company');

  const renderContent = () => {
    switch (section) {
      case 'company':
        return <CompanyInfo />;
      case 'service':
        return <CustomerService />;
      default:
        return null;
    }
  };

  return (
    <div className="pt-[80px] min-h-screen bg-gray-100 flex">
      <AboutSidebar selected={section} onSelect={setSection} />
      <main className="flex-1 p-6">{renderContent()}</main>
    </div>
  );
};

export default AboutPage;
