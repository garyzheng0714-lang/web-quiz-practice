import React from 'react';

export const ProgressBar = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-lark-gray-5 mb-2">
        <span>进度: {current}/{total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-lark-gray-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-lark-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
