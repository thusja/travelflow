import React from "react";

const menuItems = [
  {key: "company", label: "회사정보"},
  {key: "service", label: "고객센터 및 상담"},
];

const AboutSidebar = ({ selected, onSelect}) => {
  return (
    <aside className="w-60 bg-white shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">About</h2>
      <ul className="space-y-2">
        {menuItems.map(({ key, label }) => (
          <li key={key}>
            <button
              onClick={() => onSelect(key)}
              className={`w-full text-left px-4 py-2 rounded-md font-medium ${
                selected === key
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default AboutSidebar;
