import React from 'react';
import { Link } from 'react-router-dom';

const menuItems = ['Booking', 'Package', 'Planner', 'Suggest', 'Util', 'About'];

const Navigation = ({ isMobile = false, onLinkClick = () => {} }) => {
  if (isMobile) {
    return (
      <nav className="flex flex-col items-center justify-center gap-5 mt-8">
        {menuItems.map((item) => (
          <Link
            key={item}
            to={`/${item.toLowerCase()}`}
            onClick={onLinkClick}
            className="border border-gray-500 px-6 py-3 rounded-full text-base font-semibold hover:bg-gray-100 transition w-48 text-center"
          >
            {item}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden sm:flex gap-8 font-semibold text-lg">
      {menuItems.map((item) => (
        <Link
          key={item}
          to={`/${item.toLowerCase()}`}
          className="hover:text-blue-500 transition"
        >
          {item}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
