import React from 'react';

const PackageCard = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className="border rounded-md shadow-sm bg-white p-4 hover:shadow-lg transition cursor-pointer"
    >
      <h3 className="text-lg font-bold">{item.title}</h3>
      <p className="text-gray-600">{item.shortDescription}</p>
      <p className="text-sm text-blue-500 mt-1">자세히 보기 →</p>
    </div>
  );
};

export default PackageCard;
