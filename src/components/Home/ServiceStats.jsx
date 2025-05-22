import React from 'react';
import { motion } from 'framer-motion';

import calendarIcon from '@/assets/icons/serviceStats/calendar.png';
import chartIcon from '@/assets/icons/serviceStats/chart.png';
import locationIcon from '@/assets/icons/serviceStats/location.png';
import historyIcon from '@/assets/icons/serviceStats/history.png';
import worldMap from '@/assets/images/worldMap.png';

const stats = [
  { count: '12+', title: 'Years of Experience', image: calendarIcon },
  { count: '30k+', title: 'Happy Travelers', image: chartIcon },
  { count: '700+', title: 'Places Visited', image: locationIcon },
  { count: '5k+', title: 'Travel History', image: historyIcon },
];

const ServiceStats = () => {
  return (
    <section className="relative bg-[#333] w-screen py-16 flex flex-col items-center text-center text-white overflow-hidden">
      {/* 텍스트 */}
      <motion.h3
        className="text-4xl sm:text-5xl font-semibold text-gray-100 mb-2"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        We always try to give you
      </motion.h3>

      <motion.h2
        className="text-4xl sm:text-5xl font-bold text-white mb-6"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        the best service
      </motion.h2>

      <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
        We always try to make our customer happy. We provide all kind of facilities.
      </p>
      <p className="text-sm sm:text-base text-gray-200 mb-12">
        Your satisfaction is our main priority.
      </p>

      {/* 카드 영역 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 z-10 px-4 max-w-6xl w-full">
        {stats.map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-[#444] border border-gray-600 rounded-xl p-6 flex flex-col items-center shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: false, amount: 0.4 }}
          >
            <img src={item.image} alt={item.title} className="w-10 mb-4" />
            <div className="text-3xl font-bold text-white mb-2">{item.count}</div>
            <p className="text-base text-gray-200">{item.title}</p>
          </motion.div>
        ))}
      </div>


      {/* 배경 이미지 */}
      <img
        src={worldMap}
        alt="world map background"
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full opacity-100 z-10"
      />
    </section>
  );
};

export default ServiceStats;
