import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiUser, FiKey, FiClock, FiTrash2, FiClipboard,
  FiMessageCircle, FiGift, FiSettings, FiBell, FiGlobe
} from "react-icons/fi";

const MyProfileSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuSections = [
    {
      key: "profile",
      title: "내 정보",
      basePath: "/profile/info",
      items: [
        { key: "info", label: "내 정보 보기", path: "/profile/info", icon: <FiUser /> },
        { key: "password", label: "비밀번호 변경", path: "/profile/password", icon: <FiKey /> },
        { key: "logs", label: "로그인 기록", path: "/profile/logs", icon: <FiClock /> },
        { key: "withdraw", label: "회원탈퇴", path: "/profile/withdraw", icon: <FiTrash2 /> },
      ],
    },
    {
      key: "myBookings",
      title: "나의 예약",
      basePath: "/myBookings/history",
      items: [
        { key: "myBookings", label: "예약 요약", path: "/myBookings/history", icon: <FiClipboard /> },
        { key: "cancel", label: "취소 / 환불 내역", path: "/myBookings/cancel", icon: <FiTrash2 /> },
        { key: "review", label: "이용 후기 작성", path: "/myBookings/review", icon: <FiMessageCircle /> },
        { key: "points", label: "포인트 / 쿠폰 관리", path: "/myBookings/points", icon: <FiGift /> },
      ],
    },
    {
      key: "settings",
      title: "설정",
      basePath: "/settings/app",
      items: [
        { key: "app", label: "앱 설정", path: "/settings/app", icon: <FiSettings /> },
        { key: "notifications", label: "알림 설정", path: "/settings/notifications", icon: <FiBell /> },
        { key: "language", label: "언어 설정", path: "/settings/language", icon: <FiGlobe /> },
      ],
    },
  ];


  const isActivePath = (path) => currentPath === path;

  return (
    <aside className="w-64 bg-white shadow-md p-6 space-y-8">
      {menuSections.map((section) => (
        <div key={section.key}>
          <Link
            to={section.basePath}
            className={`block text-lg font-semibold mb-3 transition ${
              currentPath.startsWith(section.basePath) ? "text-blue-600" : "text-gray-800 hover:text-blue-500"
            }`}
          >
            {section.title}
          </Link>
          <ul className="space-y-1 ml-2">
            {section.items.map(({ key, label, path, icon }) => (
              <li key={key}>
                <Link
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    isActivePath(path) ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

export default MyProfileSidebar;
