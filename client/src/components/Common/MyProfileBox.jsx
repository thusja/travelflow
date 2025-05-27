import React, { useState, useRef, useEffect } from "react";
import defaultProfile from "@/assets/images/default-profile.png";
import {
  FiLogOut,
  FiUser,
  FiSettings,
  FiPackage,
  FiChevronDown
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MyProfileBox = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileSrc = user.profileImage || defaultProfile;

  return (
    <div ref={dropdownRef} className="relative profile-dropdown">
      {/* 메인 프로필 박스 */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center px-4 py-2 rounded-full border border-gray-300 bg-white shadow-sm hover:shadow-md cursor-pointer transition duration-300"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 p-[2px]">
          <div className="w-full h-full bg-white rounded-full overflow-hidden">
            <img
              src={profileSrc}
              alt="profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <span className="ml-3 font-medium text-sm text-gray-800 truncate max-w-[120px]">
          {user.nickname}
        </span>
        <FiChevronDown className="ml-2 text-gray-500 text-sm" />
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 animate-fadeIn">
          <ul className="text-sm text-gray-700 divide-y divide-gray-100">
            <li>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile/info");
                }}
                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100"
              >
                <FiUser className="mr-2" />
                내 프로필
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/myBookings/history");
                }}
                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100"
              >
                <FiPackage className="mr-2" />
                나의 예약
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/settings/app");
                }}
                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100"
              >
                <FiSettings className="mr-2" />
                설정
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 text-red-600"
              >
                <FiLogOut className="mr-2" />
                로그아웃
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyProfileBox;
