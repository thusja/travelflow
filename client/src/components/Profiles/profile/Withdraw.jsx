import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthStorage, getAccessToken } from "@/utils/authStorage.js";

const Withdraw = () => {
  const navigate = useNavigate();
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasonOptions = [
    "서비스에 만족하지 못했어요",
    "개인정보가 걱정돼요",
    "더 이상 사용하지 않아요",
    "기타 (직접 입력)",
  ];

  const handleWithdraw = async () => {
    if (!agreeChecked) {
      alert("회원 탈퇴 안내사항을 확인하고 동의해주세요.");
      return;
    }

    const finalReason = reason === "기타 (직접 입력)" ? customReason : reason;

    if (!finalReason || finalReason.trim() === "") {
      alert("탈퇴 사유를 선택하거나 입력해주세요.");
      return;
    }

    const confirmed = window.confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!confirmed) return;

    try {
      const token = getAccessToken();

      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: finalReason }),
      });

      if (!res.ok) throw new Error("탈퇴 요청 실패");

      alert("회원탈퇴가 완료되었습니다.");
      clearAuthStorage();
      navigate("/login");
    } catch (err) {
      console.error("탈퇴 오류:", err);
      alert("탈퇴 처리 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-dvh mx-auto mt-20 p-6 bg-white rounded-xl shadow text-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-center">회원 탈퇴</h2>

      {/* 회원탈퇴 안내문 */}
      <p className="text-sm text-red-600 font-semibold mb-2">※ 회원탈퇴 전 안내</p>
      <div className="pl-4 border-l-4 border-gray-300">
        <ul className="text-sm text-gray-600 space-y-1 leading-relaxed">
          <li>회원정보 및 작성하신 데이터는 삭제되며 복구되지 않습니다.</li>
          <li>탈퇴된 계정은 로그인할 수 없으며, 동일 이메일로는 새로운 회원가입이 제한됩니다.</li>
          <li>재가입을 원하실 경우, 복구 요청을 통해 계정을 활성화할 수 있습니다.</li>
        </ul>
      </div>

      {/* 탈퇴 사유 선택 */}
      <div className="mb-6 border border-gray-300 rounded-md p-4 bg-gray-50">
        <p className="text-sm font-semibold mb-4">탈퇴 사유를 선택해주세요:</p>
        <div className="space-y-2">
          {reasonOptions.map((opt) => (
            <label
              key={opt}
              className={`flex items-center px-3 py-2 rounded cursor-pointer transition 
                ${reason === opt ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
            >
              <input
                type="radio"
                name="reason"
                value={opt}
                checked={reason === opt}
                onChange={(e) => setReason(e.target.value)}
                className="mr-3 accent-blue-600"
              />
              {opt}
            </label>
          ))}
          {reason === "기타 (직접 입력)" && (
            <textarea
              placeholder="사유를 입력해주세요"
              className="w-full mt-3 border rounded p-2 text-sm"
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>
      </div>


      <label className="flex items-center mb-4 text-sm">
        <input
          type="checkbox"
          className="mr-2"
          checked={agreeChecked}
          onChange={() => setAgreeChecked(!agreeChecked)}
        />
        위 내용을 모두 확인하였으며 탈퇴에 동의합니다.
      </label>

      <button
        onClick={handleWithdraw}
        disabled={!agreeChecked}
        className={`w-full py-2 mt-4 rounded text-white font-semibold transition ${
          agreeChecked ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        탈퇴하기
      </button>
    </div>
  );
};

export default Withdraw;
