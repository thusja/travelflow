import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import defaultProfile from "@/assets/images/default-profile.png";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Info = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow-md text-gray-800">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold">내 정보</h2>
          <p className="text-sm text-gray-500">기본 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
        <button
          className="flex items-center text-blue-600 hover:underline text-sm"
          onClick={() => navigate("/profile/edit")}
        >
          <FiEdit2 className="mr-1" />
          수정하기
        </button>
      </div>

      {/* 이미지 출력만 */}
      <div className="flex justify-center mb-6">
        <img
          src={user.profileImage || defaultProfile}
          alt="프로필"
          className="w-28 h-28 rounded-full border object-cover"
        />
      </div>

      <div className="space-y-5">
        {[
          { label: "닉네임", value: user.nickname },
          { label: "이름", value: user.name },
          { label: "이메일", value: user.email },
          { label: "전화번호", value: user.phone }
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            <input
              type="text"
              value={field.value || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Info;
