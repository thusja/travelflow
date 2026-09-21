import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { requestApi } from '@/utils/request.js';
import { useToast } from '@/components/Common/ToastProvider.jsx';

const LoginForm = ({ onLogin }) => {
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeletedUser, setIsDeletedUser] = useState(false);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) =>
      requestApi(
        '/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        { errorMessage: '로그인에 실패했습니다.' },
      ),
  });

  const reactivateMutation = useMutation({
    mutationFn: (email) =>
      requestApi(
        '/api/auth/reactivate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
        { errorMessage: '재가입 요청에 실패했습니다.' },
      ),
  });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const showAlertAndFocus = (message, ref) => {
    toast.error(message);
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
      const data = await loginMutation.mutateAsync({ email, password });
      onLogin(data.user, data.token, data.refreshToken);
    } catch (err) {
      console.error('로그인 요청 오류:', err);
      if (err.message?.includes('탈퇴')) {
        setIsDeletedUser(true);
      }
      setErrorMsg(err.message || '서버 오류가 발생했습니다.');
    }
  };

  const handleReactivate = async () => {
    if (!email.trim()) {
      setErrorMsg('재가입할 이메일을 먼저 입력해주세요.');
      emailRef.current?.focus();
      return;
    }

    try {
      await reactivateMutation.mutateAsync(email);
      toast.success('재가입이 완료되었습니다. 다시 로그인해주세요.');
      setIsDeletedUser(false);
    } catch (err) {
      console.error('재가입 요청 오류:', err);
      toast.error(err.message || '재가입 요청 중 오류 발생');
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
            disabled={reactivateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {reactivateMutation.isPending ? '요청 중...' : '재가입 요청하기'}
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full sm:w-4/5 mt-6 py-2 bg-black text-white font-bold rounded-md hover:scale-105 transition"
      >
        {loginMutation.isPending ? '로그인 중...' : 'LOGIN'}
      </button>
    </form>
  );
};

export default LoginForm;
