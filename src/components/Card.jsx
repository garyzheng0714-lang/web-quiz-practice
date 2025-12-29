import React from 'react';

export const Card = ({ children, className = '', hoverable = false }) => {
  return (
    <div className={`
      bg-white 
      border border-lark-gray-2 
      rounded-lark-md 
      p-6 
      ${hoverable ? 'transition-shadow duration-200 hover:shadow-lark-base' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
