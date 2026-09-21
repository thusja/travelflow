import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import ProfileImageEditor from "@/components/Profiles/profile/ProfileImageEditor";
import defaultProfile from "@/assets/images/default-profile.png";
import { FiLoader } from "react-icons/fi";
import { getAccessToken } from "@/utils/authStorage.js";
import { requestApi } from "@/utils/request.js";
import { useToast } from "@/components/Common/ToastProvider.jsx";

const ProfileEdit = () => {
  const toast = useToast();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(user.profileImage || defaultProfile);
  const [file, setFile] = useState(null);
  const [nickname, setNickname] = useState(user.nickname || "");
  const [phone, setPhone] = useState(user.phone || "");

  const saveProfileMutation = useMutation({
    mutationFn: (formData) =>
      requestApi(
        "/api/users/profile",
        {
          method: "PUT",
          body: formData,
        },
        { requireAuth: true, errorMessage: "프로필 저장 실패" },
      ),
  });

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    if (!/^\d{10,11}$/.test(phone)) {
      toast.error("유효한 전화번호를 입력해주세요. 숫자만 입력해주세요.");
      return;
    }

    const isConfirmed = window.confirm("프로필을 수정하시겠습니까?");
    if (!isConfirmed) return;

    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("phone", phone);
    if (file) {
      formData.append("image", file);
    }

    try {
      const token = getAccessToken();
      const data = await saveProfileMutation.mutateAsync(formData);

      login(data.user, token);
      toast.success("프로필이 수정되었습니다.");
      navigate("/profile/info");
    } catch (err) {
      console.error("프로필 수정 오류:", err);
      toast.error(err.message || "서버 오류로 수정에 실패했습니다.");
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
          disabled={saveProfileMutation.isPending}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          {saveProfileMutation.isPending ? (
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
