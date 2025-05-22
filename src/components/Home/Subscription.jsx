import React from 'react';
import { motion } from 'framer-motion';
import sendIcon from '@/assets/icons/send.png';
import subscriptionImage from '@/assets/images/subscriptImg.png';

const Subscription = () => {
  return (
    <section className="relative w-full bg-[#333] py-20 flex justify-center items-center px-4">
      <motion.div
        className="relative bg-[#9FFFEC]/80 w-full max-w-screen-md rounded-[120px_20px_20px_20px] px-8 py-12 text-center shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {/* 데코 아이콘 */}
        <img
          src={sendIcon}
          alt="send icon"
          className="absolute top-6 right-6 w-6 sm:w-7"
        />

        {/* 텍스트 */}
        <h2 className="text-[#5E6282] font-semibold text-lg sm:text-xl mb-6 leading-snug">
          Subscribe to get information, latest news and other interesting offers about TF
        </h2>

        {/* 폼 */}
        <form className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <div className="relative w-full sm:w-[60%]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
            <input
              type="email"
              placeholder="Your Email"
              className="pl-9 pr-4 py-2 rounded-md w-full text-sm bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="bg-[#00A651] text-white font-medium px-6 py-2 rounded-md hover:bg-[#009045] transition duration-300 w-full sm:w-auto"
          >
            Subscribe
          </button>
        </form>

        {/* 데코 이미지 */}
        <img
          src={subscriptionImage}
          alt="decoration"
          className="absolute bottom-3 right-4 w-20 opacity-70 pointer-events-none"
        />
      </motion.div>
    </section>
  );
};

export default Subscription;
