import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import defaultProfile from "@/assets/images/default-profile.png";

const ProfileImageEditor = () => {
  const { user, login } = useAuth();
  const [preview, setPreview] = useState(user.profileImage || defaultProfile);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile-image", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, token);
        alert("프로필 이미지가 업데이트되었습니다.");
      } else {
        alert("업로드 실패: " + data.message);
      }
    } catch (err) {
      console.error("업로드 오류:", err);
      alert("서버 오류로 업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 이미지 미리보기 */}
      <img
        src={preview}
        alt="미리보기"
        className="w-28 h-28 rounded-full border object-cover"
      />

      {/* 숨긴 input + 스타일 커스텀 버튼 */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="bg-gray-200 text-sm text-gray-700 px-4 py-1 rounded hover:bg-gray-300 transition"
      >
        파일 선택
      </button>

      {/* 업로드 버튼 */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "업로드 중..." : "이미지 업로드"}
      </button>
    </div>
  );
};

export default ProfileImageEditor;
