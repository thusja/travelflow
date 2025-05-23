import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUpForm = () => {
  const [userId, setUserId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [isConfirmMatch, setIsConfirmMatch] = useState(null); // true | false | null

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhoneNumber(value);
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setName(value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage('');
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (value === '') {
      setConfirmMessage('');
      setIsConfirmMatch(null);
    } else if (value === password) {
      setConfirmMessage("패스워드가 일치합니다.");
      setIsConfirmMatch(true);
    } else {
      setConfirmMessage("패스워드가 일치하지 않습니다.");
      setIsConfirmMatch(false);
    }
  };

  const handleSignUpClick = async () => {
    if (password.length < 4) {
      setErrorMessage('패스워드의 최소길이는 4자리 입니다.');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError("패스워드가 일치하지 않습니다.");
      return;
    }

    setErrorMessage('');
    setConfirmError('');

    const userData = {
      userId,
      name,
      email,
      password,
      phone: phoneNumber,
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('회원가입이 완료되었습니다!');

        window.location.href = "/login";
      } else {
        alert('회원가입 실패: ' + data.message);
      }
    }
    catch {
      console.error("회원가입 에러 : ", err);
      alert("서버 통신 에러");
    }
  };

  return (
    <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-md rounded-lg shadow-xl p-8 flex flex-col items-start gap-5">
      <h2 className="text-xl sm:text-2xl font-bold text-black">
        Welcome to <span className="text-blue-600">Travel Flow</span>
      </h2>

      {/* ID */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">ID</label>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your ID"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Password */}
      <div className="w-full flex flex-col gap-1 relative">
        <label className="text-sm font-medium text-left">Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter your password"
          className="border border-gray-300 rounded-md px-4 py-2 pr-10 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div
          onClick={togglePasswordVisibility}
          className="absolute top-9 right-3 text-gray-500 cursor-pointer"
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
        {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>

      {/* Confirm Password */}
      <div className="w-full flex flex-col gap-1 relative">
        <label className="text-sm font-medium text-left">Confirm Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Re-enter your password"
          className="border border-gray-300 rounded-md px-4 py-2 pr-10 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div
          onClick={togglePasswordVisibility}
          className="absolute top-9 right-3 text-gray-500 cursor-pointer"
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
        {confirmMessage && (
          <p className={`text-sm mt-1 ${isConfirmMatch ? 'text-green-600' : 'text-red-500'}`}>
            {confirmMessage}
          </p>
        )}
      </div>

      {/* Name */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Name</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter your name"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Phone */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter your phone number"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        onClick={handleSignUpClick}
        className="w-full py-2 bg-black text-white rounded-md font-semibold hover:scale-105 transition mt-2"
      >
        SIGN UP
      </button>

      <p className="text-sm mt-1 self-center">
        Already have an account?
        <a href="/Login" className="text-blue-600 font-semibold ml-1">Log In</a>
      </p>
    </div>
  );
};

export default SignUpForm;
