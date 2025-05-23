import React, { useState, useEffect } from 'react';

const OnTheTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 z-50 bg-white text-black border border-gray-300 rounded-full px-4 py-3 shadow-md hover:bg-gray-100 transition"
        >
          <span className="block text-xs leading-tight">OnThe</span>
          <span className="block text-base font-bold">Top</span>
        </button>
      )}
    </>
  );
};

export default OnTheTop;
