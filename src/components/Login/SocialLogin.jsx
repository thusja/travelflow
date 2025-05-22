import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

const SocialLogin = () => (
  <>
    <p className="text-sm text-gray-600 mt-2">or</p>

    <div className="relative w-full sm:w-4/5">
      <button className="w-full border-2 border-gray-600 rounded-md px-4 py-2 flex items-center justify-center hover:bg-white transition font-semibold text-black relative">
        <span className="absolute left-4"><FcGoogle size={22} /></span>
        <span className="mx-auto">Login with Google</span>
      </button>
    </div>

    <div className="relative w-full sm:w-4/5">
      <button className="w-full border-2 border-gray-600 rounded-md px-4 py-2 flex items-center justify-center hover:bg-white transition font-semibold text-black relative">
        <span className="absolute left-4"><RiKakaoTalkFill size={22} className="text-yellow-400" /></span>
        <span className="mx-auto">Login with Kakao</span>
      </button>
    </div>
  </>
);

export default SocialLogin;
