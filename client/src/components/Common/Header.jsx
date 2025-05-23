import React, { useState } from 'react';
import Navigation from './Navigation';
import logo from '@/assets/images/logo.png';
import { MdMenu } from 'react-icons/md';
import { ImCross } from 'react-icons/im';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const [openNav, setOpenNav] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if(location.pathname === "/") {
      window.scrollTo(0, 0);
    }
    else {
      navigate("/");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-sm shadow-md h-[80px] px-6 sm:px-20 flex items-center justify-between">
        {/* 로고 */}
        <button onClick={handleLogoClick} className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className="h-[110px] w-auto max-w-[160px] cursor-pointer"
          />
        </button>

        {/* 데스크탑 네비게이션 */}
        <div className="hidden sm:flex flex-1 justify-center">
          <Navigation />
        </div>

        {/* 로그인 + 모바일 아이콘 */}
        <div className="flex items-center gap-4">
          <Link
            to="/Login"
            className="bg-black text-white px-4 py-2 rounded-md font-semibold text-lg hover:bg-white hover:text-black transition mr-2 sm:mr-4"
          >
            Login
          </Link>
          <div className="sm:hidden">
            {openNav ? (
              <ImCross onClick={() => setOpenNav(false)} size="30" className="cursor-pointer" />
            ) : (
              <MdMenu onClick={() => setOpenNav(true)} size="36" className="cursor-pointer" />
            )}
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      {openNav && (
        <div className="fixed top-0 left-0 w-full h-screen bg-white z-40 flex flex-col overflow-y-auto">
          {/* 상단 바 */}
          <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-sky-200 to-purple-200">
            <img src={logo} alt="logo" className="h-10" />
            <div className="flex items-center gap-3">
              <Link
                to="/Login"
                className="bg-black text-white 
                px-4 py-2 text-lg font-semibold rounded-md 
                hover:bg-white hover:text-black transition
                mr-2 sm:mr-4
                max-sm:text-sm max-sm:px-3 max-sm:py-1"
              >
                Login
              </Link>

              <ImCross
                onClick={() => setOpenNav(false)}
                className="text-2xl cursor-pointer"
              />
            </div>
          </div>

          {/* 모바일 네비게이션 */}
          <Navigation isMobile onLinkClick={() => setOpenNav(false)} />
        </div>
      )}
    </>
  );
};

export default Header;
