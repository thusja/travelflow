import { useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";

const Notifications = () => {
  const [settings, setSettings] = useState({
    email: true,
    reminder: true,
    marketing: false,
    security: true,
    update: true,
    push: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(settings));
  }, [settings]);

  const toggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notifications: updated }),
      });

      if (!res.ok) {
        throw new Error("업데이트 실패");
      }
    } catch (err) {
      alert("알림 설정 저장 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  const options = [
    {
      key: "email",
      title: "이메일 알림 수신",
      desc: "예약 확인, 취소 안내 등을 이메일로 받아봅니다.",
    },
    {
      key: "reminder",
      title: "하루 전 알림",
      desc: "예약 하루 전에 이메일 또는 앱으로 알려드립니다.",
    },
    {
      key: "marketing",
      title: "마케팅 알림 수신",
      desc: "이벤트, 할인 정보 등 유용한 소식을 받아보세요.",
    },
    {
      key: "security",
      title: "보안 알림",
      desc: "새로운 기기에서 로그인 시 이메일로 알림을 보냅니다.",
    },
    {
      key: "update",
      title: "예약 변경/취소 알림",
      desc: "예약 일정이 변경되거나 취소되면 즉시 알려드립니다.",
    },
    {
      key: "push",
      title: "앱 푸시 알림",
      desc: "앱 설치 시 푸시로 실시간 알림을 수신합니다.",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 space-y-8 text-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
        <MdSettings className="text-blue-600" />
        알림 설정
      </h2>

      <section className="bg-white border rounded-xl p-8 shadow-sm space-y-6">
        {options.map((item) => (
          <div key={item.key} className="flex items-start justify-between">
            <div className="flex-1 pr-4 text-left">
              <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
            <label className="inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings[item.key]}
                onChange={() => toggle(item.key)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 relative transition">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 peer-checked:translate-x-5 transition-transform shadow" />
              </div>
            </label>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Notifications;
