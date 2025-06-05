import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileImageEditor from "@/components/Profiles/profile/ProfileImageEditor";
import defaultProfile from "@/assets/images/default-profile.png";
import { FiLoader } from "react-icons/fi";

const ProfileEdit = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(user.profileImage || defaultProfile);
  const [file, setFile] = useState(null);
  const [nickname, setNickname] = useState(user.nickname || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (!/^\d{10,11}$/.test(phone)) {
      alert("유효한 전화번호를 입력해주세요. 숫자만 입력해주세요.");
      return;
    }

    const confirm = window.confirm("프로필을 저장하시겠습니까?");
    if (!confirm) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("nickname", nickname);
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
    <div className="max-w-xl mx-auto mt-16 bg-white p-10 rounded-2xl shadow-2xl border border-gray-200 text-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-center">프로필 수정</h2>

      <ProfileImageEditor
        preview={preview}
        setPreview={setPreview}
        setFile={setFile}
      />

      <div className="space-y-6 mt-10">
        {/* 닉네임 */}
        <div>
          <label className="block text-sm font-medium text-left text-gray-700 mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-400 rounded-md text-left bg-gray-100 text-gray-900"
          />
        </div>

        {/* 이름 (읽기 전용) */}
        <div>
          <label className="block text-sm font-medium text-left text-gray-700 mb-1">이름</label>
          <div className="flex gap-4">
            <div className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-left bg-gray-100 text-gray-800">
              {user.lastname}
            </div>
            <div className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md bg-gray-100 text-gray-800 text-left">
              {user.firstname}
            </div>
          </div>
        </div>

        {/* 이메일 (읽기 전용) */}
        <div>
          <label className="block text-sm font-medium text-left text-gray-700 mb-1">이메일</label>
          <div className="px-4 py-2.5 border border-gray-300 rounded-md text-left bg-gray-100 text-gray-800">
            {user.email}
          </div>
        </div>

        {/* 전화번호 (수정 가능) */}
        <div>
          <label className="block text-sm font-medium text-left text-gray-700 mb-1">전화번호</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-400 rounded-md text-left bg-gray-100 text-gray-900"
          />
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end mt-10 gap-2">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
