import React, { useEffect } from 'react';
import Header from '@/components/Common/Header';
import Hero from '@/components/Home/Hero';
import Service from '@/components/Home/Service';
import ServiceStats from '@/components/Home/ServiceStats';
import Packages from '@/components/Home/Packages';
import BookingSteps from '@/components/Home/BookingSteps';
import Reviews from '@/components/Home/Reviews';
import Subscription from '@/components/Home/Subscription';
import Footer from '@/components/Common/Footer';
import OnTheTop from '@/utils/OnTheTop';

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
      <Footer />
      <OnTheTop />
    </div>
  );
};

export default HomePage;
