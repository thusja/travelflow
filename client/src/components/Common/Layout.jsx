import React from 'react';
import Header from './Header';
import OnTheTop from '@/utils/OnTheTop';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header />
      <OnTheTop />
      <main className="pt-[80px] min-h-screen bg-gray-100">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
