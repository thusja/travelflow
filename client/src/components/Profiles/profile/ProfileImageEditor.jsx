// ProfileImageEditor.jsx
import React, { useRef } from "react";

const ProfileImageEditor = ({ preview, setPreview, setFile }) => {
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={preview}
        alt="미리보기"
        className="w-28 h-28 rounded-full border object-cover"
      />
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
        프로필 이미지 선택
      </button>
    </div>
  );
};

export default ProfileImageEditor;
