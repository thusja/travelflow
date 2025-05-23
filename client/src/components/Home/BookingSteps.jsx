import React from 'react';

import step1 from '@/assets/images/step/step1.png';
import step2 from '@/assets/images/step/step2.png';
import step3 from '@/assets/images/step/step3.png';
import greeceExample from '@/assets/images/step/greeceExample.png';

const steps = [
  {
    image: step1,
    title: 'Choose Destination',
    text: '여행지를 선택하기 전에 먼저 숙소를 예약해 주세요.',
  },
  {
    image: step2,
    title: 'Make Payment',
    text: '결제는 현금과 카드로 나누어 진행하실 수 있습니다.',
  },
  {
    image: step3,
    title: 'Reach Airport on Selected Date',
    text: '선택하신 날짜에 맞춰 공항버스를 이용해 편리하게 공항에 도착하실 수 있습니다.',
  },
];

const BookingSteps = () => {
  return (
    <section className="bg-[#333] w-screen pt-12 pb-6 sm:pt-12 sm:pb-10 px-4 flex flex-col items-center text-white text-center">
      <h2 className="text-2xl sm:text-3xl font-bold mb-2">Book Your Next Trip in 3 Easy Steps</h2>
      <h3 className="text-xl font-medium text-[#feb236]">Easy and Fast</h3>

      <div className="flex w-full justify-between items-center max-w-7xl mx-auto flex-col-reverse md:flex-row">
        {/* 왼쪽 */}
        <div className="flex flex-col gap-6 md:ml-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-6 md:gap-8 text-left max-md:flex-col max-md:items-center">
              <img src={step.image} alt={step.title} className="h-16 sm:h-20" />
              <div>
                <h4 className="text-lg font-semibold text-[#feb236] mb-2 text-center md:text-left">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-200 text-center md:text-left">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 오른쪽 */}
        <div className="md:mr-12 mb-4 md:mb-0 max-w-[400px]">
          <img src={greeceExample} alt="example" className="w-full h-auto rounded-md shadow-lg" />
        </div>
      </div>
    </section>
  );
};

export default BookingSteps;
