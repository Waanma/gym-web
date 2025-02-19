// components/Loader.tsx
import React from 'react';
import { Triangle } from 'react-loader-spinner';

const DashboardLoader = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <Triangle
        visible={true}
        height="120"
        width="120"
        color="#4fa94d"
        ariaLabel="triangle-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default DashboardLoader;
