import React from 'react';
import { motion } from 'framer-motion';
import ticketIcon from '@/assets/icons/service/ticket.png';
import bedIcon from '@/assets/icons/service/bed.png';
import tourBusIcon from '@/assets/icons/service/tourBus.png';
import tourGuideIcon from '@/assets/icons/service/tourGuide.png';

const cards = [
  {
    title: 'Ticket Booking',
    text: '귀하의 목적지에 대한 모든 종류의 국내외 항공권을 예약합니다.',
    image: ticketIcon,
  },
  {
    title: 'Hotel Booking',
    text: '귀하의 예산에 맞는 호텔을 쉽게 예약하실 수 있습니다.',
    image: bedIcon,
  },
  {
    title: 'Tour Plan',
    text: '우리는 짧은 시간 내에 최선의 계획을 제공합니다.',
    image: tourBusIcon,
  },
  {
    title: 'Guide Booking',
    text: '우리는 친절한 가이드를 통해 기분 좋은 여행이 되도록 노력합니다.',
    image: tourGuideIcon,
  },
];

const Service = () => {
  return (
    <section className="w-full bg-gray-800 py-12 flex flex-col items-center px-4">
      <motion.h2
        className="text-white text-3xl font-semibold text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Our Services
      </motion.h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-lg shadow-md w-full h-[220px] flex flex-col items-center justify-center text-center p-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            <img src={card.image} alt={card.title} className="w-10 mb-4" />
            <p className="text-lg font-semibold text-black mb-2">{card.title}</p>
            <p className="text-sm text-gray-700">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Service;
