import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header />
      <main className="pt-[80px] min-h-screen bg-gray-100">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
