import React from 'react';
import { InfinitySpin } from 'react-loader-spinner';

const InfiniteLoader = () => {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <InfinitySpin
        visible={true}
        width="80"
        color="#4fa94d"
        ariaLabel="infinity-spin-loading"
      />
    </div>
  );
};

export default InfiniteLoader;
