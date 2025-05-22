import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import reviewBg from '@/assets/images/reviewBg.png';
import avatarImg from '@/assets/images/person.png';

const reviews = [
  { text: 'asdasdasdaadad', author: 'zxczxczcxcxzczxczxczczxczc' },
  { text: 'yrtytryrtyryy', author: 'cdfggdfasdasdasdadsddfgdgd' },
  { text: 'vbnvbvnvn', author: 'fghfghfhghadasdasdadadasdad' },
  { text: '23432432', author: '879789789657567576575676576' },
];

const Reviews = () => {
  const [index, setIndex] = useState(0);

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-[#333] text-white w-screen py-12 sm:py-16 flex flex-col items-center justify-center px-4">
      {/* 제목 */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">
        우리 페이지에 대한 소리를 들려 주세요
      </h2>

      {/* 슬라이드 영역 */}
      <div className="relative w-full max-w-3xl h-[300px] flex items-center justify-center">
        {/* 배경 이미지 */}
        <img
          src={reviewBg}
          alt="background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-20 rounded-lg"
        />

        {/* 슬라이드 콘텐츠 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center text-center backdrop-blur-sm bg-black/30 p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <img src={avatarImg} alt="avatar" className="w-24 h-24 rounded-full mb-4" />
            <p className="italic mb-2">{reviews[index].text}</p>
            <span className="font-semibold text-sm">{reviews[index].author}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Reviews;
