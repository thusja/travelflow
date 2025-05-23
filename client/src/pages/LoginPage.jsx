import React from 'react';
import loginCover from '@/assets/images/loginCover.png';
import LoginForm from '@/components/Login/LoginForm';
import SocialLogin from '@/components/Login/SocialLogin';

const LoginPage = () => {
  const handleLogin = async ({ email, password }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if(res.ok) {
        // 토큰 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("로그인 성공!");

        window.location.href = "/";
      }
      else {
        alert("로그인 실패 : " + data.message);
      }
    }
    catch(err) {
      console.error("로그인 오류 : ", err);
      alert("서버와 통신할 수 없습니다.");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-200 px-4 relative">
      <div className="w-full max-w-5xl rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center gap-4">
          <LoginForm onLogin={handleLogin} />
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
