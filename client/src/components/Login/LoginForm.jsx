import { useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeletedUser, setIsDeletedUser] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const showAlertAndFocus = (message, ref) => {
    alert(message);
    ref.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('이메일을 입력해주세요.');
      showAlertAndFocus('이메일을 입력해주세요.', emailRef);
      return;
    }
    if (!password.trim()) {
      setErrorMsg('비밀번호를 입력해주세요.');
      showAlertAndFocus('비밀번호를 입력해주세요.', passwordRef);
      return;
    }
    setErrorMsg('');
    setIsDeletedUser(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if(!res.ok) {
        if(data.message?.includes("탈퇴")) {
          setIsDeletedUser(true);
        }
        setErrorMsg(data.message || "로그인에 실패했습니다.");
        return;
      }

      // 로그인 성공
      onLogin(data.user, data.token);
    }
    catch(err) {
      console.error("로그인 요청 오류 : ", err);
      setErrorMsg("서버 오류가 발생했습니다.");
    }
  };

  const handleReactivate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert("재가입이 완료되었습니다. 다시 로그인해주세요.");
        setIsDeletedUser(false);
      } else {
        alert(`재가입 실패: ${data.message}`);
      }
    }
    catch(err) {
      console.error("재가입 요청 오류 : ",err);
      alert("재가입 요청 중 오류 발생");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4">
      <p className="text-xl sm:text-2xl font-bold text-black text-center">
        Welcome back to <span className="text-blue-600">Travel Flow</span>
      </p>

      <input
        type="email"
        ref={emailRef}
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full sm:w-4/5 px-4 py-2 rounded-md bg-black/10 border border-gray-300 text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-gray-400"
      />

      <div className="relative w-full sm:w-4/5">
        <input
          type={showPassword ? 'text' : 'password'}
          ref={passwordRef}
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

      {isDeletedUser && (
        <div className="w-full sm:w-4/5 mt-4 p-3 border border-yellow-300 bg-yellow-50 rounded text-sm text-yellow-800">
          <p className="mb-2 font-semibold">해당 계정은 탈퇴 처리된 상태입니다.</p>
          <p className="mb-2">재가입 하시려면 아래 버튼을 눌러주세요.</p>
          <button
            type="button"
            onClick={handleReactivate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            재가입 요청하기
          </button>
        </div>
      )}

      <button
        type="submit"
        className="w-full sm:w-4/5 mt-6 py-2 bg-black text-white font-bold rounded-md hover:scale-105 transition"
      >
        LOGIN
      </button>
    </form>
  );
};

export default LoginForm;
