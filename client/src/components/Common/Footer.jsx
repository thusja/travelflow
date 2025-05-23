import React from 'react';
import logo from '@/assets/images/logo.png';
import xIcon from '@/assets/icons/social/xIcon.png';
import facebookIcon from '@/assets/icons/social/facebookIcon.png';
import instagramIcon from '@/assets/icons/social/instagramIcon.png';
import youtubeIcon from '@/assets/icons/social/youtubeIcon.png';

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white px-6 py-2">
      {/* 상단 콘텐츠 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-center md:text-left">
        {/* 로고 + 설명 */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <img src={logo} alt="logo" className="h-30 w-30 ml-1 md:ml-9 " />
          <p className="text-sm max-w-[200px] leading-relaxed">
            Book your trip in minutes, get full control for much longer.
          </p>
        </div>

        {/* 가운데 비워두거나 추가 가능 */}
        <div className="hidden md:flex" />

        {/* 소셜 미디어 */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <p className="text-sm font-semibold ml-1 md:mr-8">Discover Our Social</p>
          <div className="flex gap-3">
            <a href="https://x.com/home" target="_blank" rel="noopener noreferrer">
              <img src={xIcon} alt="X" className="w-10 h-10 hover:scale-110 transition" />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={facebookIcon} alt="Facebook" className="w-10 h-10 hover:scale-110 transition" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <img src={instagramIcon} alt="Instagram" className="w-10 h-10 hover:scale-110 transition" />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <img src={youtubeIcon} alt="YouTube" className="w-10 h-10 hover:scale-110 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* 하단 카피라이트 */}
      <div className="mt-10 text-center text-xs text-gray-400">
        © 2025 TF. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
