import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileImageEditor from "./ProfileImageEditor";

const ProfileEdit = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: user.nickname || "",
    name: user.name || "",
    phone: user.phone || ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, token);
        alert("프로필 정보가 수정되었습니다.");
        navigate("/profile/info");
      } else {
        alert("수정 실패: " + data.message);
      }
    } catch (err) {
      console.error("수정 오류:", err);
      alert("서버 오류로 수정을 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-2xl shadow-md text-gray-800">
      <h2 className="text-2xl font-bold mb-6">프로필 수정</h2>
      <ProfileImageEditor />

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
          <input
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/profile/info")}
            className="px-4 py-2 text-sm border border-gray-400 rounded-md hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
