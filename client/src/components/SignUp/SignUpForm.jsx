import React, { useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUpForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isConfirmMatch, setIsConfirmMatch] = useState(null);

  const refs = {
    firstName: useRef(null),
    lastName: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
    nickname: useRef(null),
    phone: useRef(null),
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPhone(value);
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
      setConfirmMessage('패스워드가 일치합니다.');
      setIsConfirmMatch(true);
    } else {
      setConfirmMessage('패스워드가 일치하지 않습니다.');
      setIsConfirmMatch(false);
    }
  };

  const showToastAndFocus = (msg, refName) => {
    alert(msg);
    refs[refName].current?.focus();
  };

  const handleSignUpClick = async (e) => {
    e.preventDefault();

    if (!firstName.trim()) return showToastAndFocus("이름을 입력해주세요.", "firstName");
    if (!lastName.trim()) return showToastAndFocus("성을 입력해주세요.", "lastName");
    if (!email.trim()) return showToastAndFocus("이메일을 입력해주세요.", "email");
    if (!password.trim()) return showToastAndFocus("비밀번호를 입력해주세요.", "password");
    if (!confirmPassword.trim()) return showToastAndFocus("비밀번호 확인을 입력해주세요.", "confirmPassword");
    if (!nickname.trim()) return showToastAndFocus("닉네임을 입력해주세요.", "nickname");
    if (!phone.trim()) return showToastAndFocus("전화번호를 입력해주세요.", "phone");

    if (password.length < 6) {
      setErrorMessage('패스워드의 최소길이는 6자리 입니다.');
      refs.password.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError('패스워드가 일치하지 않습니다.');
      refs.confirmPassword.current?.focus();
      return;
    }

    setErrorMessage('');
    setConfirmError('');

    const userData = {
      firstname: firstName,
      lastname: lastName,
      nickname,
      email,
      password,
      phone,
    };

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('회원가입이 완료되었습니다!');
        window.location.href = "/login";
      } else {
        alert('회원가입 실패: ' + data.message);
      }
    } catch (err) {
      console.error("회원가입 에러:", err);
      alert("서버 통신 에러");
    }
  };

  return (
    <form
      onSubmit={handleSignUpClick}
      className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-md rounded-lg shadow-xl p-8 flex flex-col items-start gap-5"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-black">
        Welcome to <span className="text-blue-600">Travel Flow</span>
      </h2>

      {/* 이름 */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Real Name</label>
        <div className="flex gap-2">
          <input
            type="text"
            ref={refs.firstName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-1/2 border border-gray-300 rounded-md px-4 py-2 bg-white"
          />
          <input
            type="text"
            ref={refs.lastName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="w-1/2 border border-gray-300 rounded-md px-4 py-2 bg-white"
          />
        </div>
      </div>

      {/* 이메일 */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Email</label>
        <input
          type="email"
          ref={refs.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white"
        />
      </div>

      {/* 비밀번호 */}
      <div className="w-full flex flex-col gap-1 relative">
        <label className="text-sm font-medium text-left">Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          ref={refs.password}
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter your password"
          className="border border-gray-300 rounded-md px-4 py-2 pr-10 bg-white"
        />
        <div
          onClick={togglePasswordVisibility}
          className="absolute top-9 right-3 text-gray-500 cursor-pointer"
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </div>
        {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>

      {/* 비밀번호 확인 */}
      <div className="w-full flex flex-col gap-1 relative">
        <label className="text-sm font-medium text-left">Confirm Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          ref={refs.confirmPassword}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Re-enter your password"
          className="border border-gray-300 rounded-md px-4 py-2 pr-10 bg-white"
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

      {/* 닉네임 */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Nickname</label>
        <input
          type="text"
          ref={refs.nickname}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Enter your nickname"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white"
        />
      </div>

      {/* 전화번호 */}
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-left">Phone Number</label>
        <input
          type="tel"
          ref={refs.phone}
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Enter your phone number"
          className="border border-gray-300 rounded-md px-4 py-2 bg-white"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-black text-white rounded-md font-semibold hover:scale-105 transition mt-2"
      >
        SIGN UP
      </button>

      <p className="text-sm mt-1 self-center">
        Already have an account?
        <a href="/Login" className="text-blue-600 font-semibold ml-1">Log In</a>
      </p>
    </form>
  );
};

export default SignUpForm;
