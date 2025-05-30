import React, { useState } from 'react';
import loginCover from '@/assets/images/loginCover.png';
import LoginForm from '@/components/Login/LoginForm';
import SocialLogin from '@/components/Login/SocialLogin';
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();

  // 탈퇴 계정 여부 전달용 상태
  const [loginError, setLoginError] = useState({ type: "", message: ""});

  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if(res.ok) {
        login(data.user, data.token); // 전역 로그인 처리
        window.location.href = "/";
      }
      else {
        // 🔥 탈퇴 계정 메시지 구분
        if (data.message?.includes("탈퇴")) {
          setLoginError({ type: "deleted", message: data.message });
        } else {
          setLoginError({ type: "error", message: data.message });
        }
      }
    }
    catch(err) {
      console.error("로그인 오류 : ", err);
      setLoginError({ type: "error", message: "서버와 통신할 수 없습니다." });
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-200 px-4 relative">
      <div className="w-full max-w-5xl rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center gap-4">
          <LoginForm onLogin={handleLogin}/>

          <SocialLogin />

          <p className="text-sm mt-3">
            Don't have an account?
            <a href="/SignUp" className="text-blue-600 font-semibold pl-1">Sign Up</a>
          </p>
        </div>

        <div className="hidden md:block md:w-1/2">
          <img src={loginCover} alt="Login Cover" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <div className="absolute inset-0 md:hidden z-0">
        <img
          src={loginCover}
          alt="Mobile Background"
          className="w-full h-full object-cover object-bottom opacity-40"
        />
      </div>
    </div>
  );
};

export default LoginPage;
