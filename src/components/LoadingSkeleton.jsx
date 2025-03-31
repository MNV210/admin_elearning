import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-300 rounded-lg shadow-md p-6 h-32"></div>
        <div className="bg-gray-300 rounded-lg shadow-md p-6 h-32"></div>
        <div className="bg-gray-300 rounded-lg shadow-md p-6 h-32"></div>
      </div>
      <div className="bg-gray-300 rounded-lg shadow-md p-6 h-64"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-300 rounded-lg shadow-md p-6 h-64"></div>
        <div className="bg-gray-300 rounded-lg shadow-md p-6 h-64"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
