import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 border-t-neon-blue animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-gray-100 border-b-violet-glow animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-gradient-to-r from-neon-blue to-violet-glow rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <p className="ml-4 font-poppins text-gray-600 animate-pulse">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
