import React from 'react';

const PackageDetail = ({ data, onBack }) => {
  return (
    <div className="bg-white p-6 rounded-md shadow">
      <button
        onClick={onBack}
        className="text-blue-500 underline mb-4 text-sm"
      >
        ← 목록으로 돌아가기
      </button>
      <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
      <p className="text-gray-600 mb-4">{data.description}</p>
      <ul className="list-disc list-outside pl-5 space-y-1 text-gray-700">
        {data.details.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    </div>
  );
};

export default PackageDetail;
