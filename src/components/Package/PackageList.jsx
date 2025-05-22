import React from 'react';
import PackageCard from './PackageCard';

const PackageList = ({ packages, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} item={pkg} onClick={onSelect} />
      ))}
    </div>
  );
};

export default PackageList;
