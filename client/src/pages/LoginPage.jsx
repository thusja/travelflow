import React from 'react';
import loginCover from '@/assets/images/loginCover.png';
import LoginForm from '@/components/Login/LoginForm';
import SocialLogin from '@/components/Login/SocialLogin';

const LoginPage = () => {
  const handleLogin = ({ email, password }) => {
    console.log("로그인 요청:", { email, password });
    // 실제 로그인 처리 API 연동 등
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
