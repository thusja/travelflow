import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileImageEditor from "@/components/Profiles/profile/ProfileImageEditor";
import defaultProfile from "@/assets/images/default-profile.png";

const ProfileEdit = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(user.profileImage || defaultProfile);
  const [file, setFile] = useState(null);
  const [nickname, setNickname] = useState(user.nickname || "");
  const [firstname, setFirstname] = useState(user.firstname || "");
  const [lastname, setLastname] = useState(user.lastname || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const confirm = window.confirm("프로필을 저장하시겠습니까?");
    if (!confirm) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("phone", phone);
    if (file) {
      formData.append("image", file);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, token);
        alert("프로필이 저장되었습니다.");
        navigate("/profile/info");
      } else {
        alert("저장 실패: " + data.message);
      }
    } catch (err) {
      console.error("저장 오류:", err);
      alert("서버 오류로 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-10 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">프로필 수정</h2>

      <ProfileImageEditor
        preview={preview}
        setPreview={setPreview}
        setFile={setFile}
      />

      <div className="space-y-4 mt-8">
        <div>
          <label className="text-sm font-medium">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm font-medium">이름</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="이름"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="성"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-md"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">전화번호</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8 gap-2">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
