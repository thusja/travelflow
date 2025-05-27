import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import defaultProfile from "@/assets/images/default-profile.png";
import { FiEdit2, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const getDaysSince = (createdAt) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const Info = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const joinedAt = user.created_at;
  const daysPassed = joinedAt ? getDaysSince(joinedAt) : null;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-2xl text-gray-900 relative border border-gray-200">
        {/* 수정 버튼 */}
        <button
          className="absolute top-6 right-6 text-blue-600 hover:underline text-sm flex items-center"
          onClick={() => navigate("/profile/edit")}
        >
          <FiEdit2 className="mr-1" />
          수정하기
        </button>

        {/* 헤더 */}
        <div className="text-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold">내 정보</h2>
          <p className="text-sm text-gray-500 mt-1">
            기본 정보를 확인하고 수정할 수 있습니다.
          </p>
        </div>

        {/* 프로필 */}
        <div className="flex justify-center mb-8">
          <img
            src={user.profileImage || defaultProfile}
            alt="프로필"
            className="w-28 h-28 rounded-full border object-cover"
          />
        </div>

        {/* 정보 입력 영역 */}
        <div className="space-y-5">
          <InputRow label="닉네임" value={user.nickname} />

          <div>
            <label className="block text-sm font-medium text-left text-gray-700 mb-1">이름</label>
            <div className="flex gap-4">
              <InputRow value={user.firstname} className="basis-[48%] text-left" placeholder="이름" />
              <InputRow value={user.lastname} className="basis-[48%] text-left ml-5" placeholder="성" />
            </div>
          </div>

          <InputRow label="이메일" value={user.email} type="email" />
          <InputRow label="전화번호" value={user.phone} type="tel" />

          <div>
            <label className="block text-sm font-medium text-left text-gray-700 mb-1">가입일</label>
            <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-400 rounded-md bg-gray-100 text-gray-900 text-left">
              <FiCalendar className="text-gray-500" />
              <span className="text-sm">
                {joinedAt
                  ? `${new Date(joinedAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} (${daysPassed}일 경과)`
                  : "정보 없음"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 공통 인풋 컴포넌트
const InputRow = ({ label, value, type = "text", className = "w-full", placeholder }) => (
  <div className={label ? "" : className}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1 text-left">{label}</label>
    )}
    <input
      type={type}
      value={value || ""}
      readOnly
      placeholder={placeholder}
      className={`px-4 py-2.5 border border-gray-400 rounded-md bg-gray-100 text-gray-900 text-left ${className}`}
    />
  </div>
);

export default Info;
