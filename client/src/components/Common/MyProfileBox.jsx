import React from "react";
import profile from "@/assets/images/default-profile.png";

const MyProfileBox = ({ user, onLogout}) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow border">
      {/* 프로필 이미지 (기본 이미지) */}
      <img
        src={profile}
        alt="profile"
        className="w-10 h-10 rounded-full object-cover border"
      />

      {/* 닉네임 */}
      <span className="font-semibold text-gray-800">{user.name}</span>

      {/* 로그아웃 버튼 */}
      <button onClick={onLogout} className="ml-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition">로그아웃</button>

    </div>
  )
}

export default MyProfileBox;
