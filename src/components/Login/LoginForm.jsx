import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setErrorMsg('');
    onLogin({ email, password });
  };

  return (
    <>
      <p className="text-xl sm:text-2xl font-bold text-black text-center">
        Welcome back to <span className="text-blue-600">Travel Flow</span>
      </p>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full sm:w-4/5 px-4 py-2 rounded-md bg-black/10 border border-gray-300 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-400"
      />

      <div className="relative w-full sm:w-4/5">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-md bg-black/10 border border-gray-300 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <div
          onClick={togglePasswordVisibility}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 text-lg"
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
      </div>

      {errorMsg && (
        <p className="text-red-500 text-sm w-full sm:w-4/5 text-left mt-1">
          {errorMsg}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="w-full sm:w-4/5 mt-6 py-2 bg-black text-white font-bold rounded-md hover:scale-105 transition"
      >
        LOGIN
      </button>
    </>
  );
};

export default LoginForm;
