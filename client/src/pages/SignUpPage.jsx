import React from 'react';
import signUpBg from '@/assets/images/signUpBackground.png';
import SignUpForm from '@/components/SignUp/SignUpForm';

const SignUpPage = () => {
  return (
    <div
      className="relative w-screen h-screen flex justify-center items-center bg-gray-100 px-4"
      style={{
        backgroundImage: `url(${signUpBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-white opacity-60 z-0" />
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
