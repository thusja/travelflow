import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Packages = () => {
  const [selectedPackage, setSelectedPackage] = useState('Hot Deals');
  const navigate = useNavigate();

  const tabs = ['Hot Deals', 'Special Offers', 'Discounts'];
  const packageContent = {
    'Hot Deals': '🔥 Hot deals content goes here.',
    'Special Offers': '🎁 Special offers content goes here.',
    'Discounts': '💸 Discounts content goes here.',
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Best Packages For You
      </h2>

      {/* 탭 선택 */}
      <div className="flex justify-center border-b border-gray-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedPackage(tab)}
            className={`px-6 py-2 transition-colors duration-300 text-sm sm:text-base font-medium 
              ${
                selectedPackage === tab
                  ? 'bg-blue-600 text-white rounded-t'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="min-h-[120px] flex items-center justify-center text-center text-gray-700 text-base">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPackage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {packageContent[selectedPackage]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Discover More 버튼 */}
      <div className="mt-10 text-center">
        <button
          onClick={() => navigate('/package')}
          className="inline-block bg-emerald-600 text-white px-10 py-4 rounded hover:bg-emerald-500 transition duration-300 text-base font-semibold"
        >
          Discover More
        </button>
      </div>
    </section>
  );
};

export default Packages;
