import React, { useEffect } from 'react';
import Hero from '@/components/Home/Hero';
import Service from '@/components/Home/Service';
import ServiceStats from '@/components/Home/ServiceStats';
import Packages from '@/components/Home/Packages';
import BookingSteps from '@/components/Home/BookingSteps';
import Reviews from '@/components/Home/Reviews';
import Subscription from '@/components/Home/Subscription';

const HomePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <Hero />
      <Service />
      <ServiceStats />
      <Packages />
      <BookingSteps />
      <Reviews />
      <Subscription />
    </div>
  );
};

export default HomePage;
