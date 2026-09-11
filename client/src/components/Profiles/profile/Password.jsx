import { useState } from "react";
import { getAccessToken } from "@/utils/authStorage.js";

const Password = () => {
  const [step, setStep] = useState(1); // 1단계: 현재 비밀번호 확인
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyCurrentPassword = async () => {
    if (!currentPassword) return alert("현재 비밀번호를 입력해주세요.");
    setLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch("http://localhost:5000/api/users/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: currentPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2); // 다음 단계로 이동
      } else {
        alert("비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("비밀번호 확인 오류:", err);
      alert("서버 오류로 인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) return alert("새 비밀번호를 모두 입력해주세요.");
    if (newPassword !== confirmPassword) return alert("새 비밀번호와 확인이 일치하지 않습니다.");
    if (newPassword.length < 6) return alert("비밀번호는 최소 6자 이상이어야 합니다.");

    setLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch("http://localhost:5000/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setStep(1);
      } else {
        alert("변경 실패: " + data.message);
      }
    } catch (err) {
      console.error("비밀번호 변경 오류:", err);
      alert("서버 오류로 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-[80vh] bg-gray-50 py-40 px-4 mr-40">
      <div className="w-full max-w-2xl bg-white px-12 py-14 rounded-2xl shadow-md border text-gray-900">
        <h2 className="text-2xl font-bold mb-10 text-center">비밀번호 변경</h2>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={verifyCurrentPassword}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "확인 중..." : "비밀번호 확인"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="flex justify-between mt-10">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "저장 중..." : "비밀번호 변경"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Password;
