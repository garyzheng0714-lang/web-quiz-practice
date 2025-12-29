import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";
  
  const variants = {
    primary: "bg-lark-primary hover:bg-lark-primary-hover active:bg-lark-primary-active text-white shadow-sm disabled:bg-lark-gray-3",
    outline: "bg-white border border-lark-gray-2 text-lark-gray-6 hover:bg-lark-gray-1 hover:border-lark-gray-3 active:bg-lark-gray-2 disabled:bg-white disabled:border-lark-gray-2",
    ghost: "bg-transparent text-lark-gray-6 hover:bg-lark-gray-1 active:bg-lark-gray-2",
    danger: "bg-lark-error hover:bg-[#d9363e] active:bg-[#b3242b] text-white"
  };

  const sizes = {
    sm: "h-7 px-3 text-xs rounded-lark-sm",
    md: "h-8 px-4 text-sm rounded-lark-sm",
    lg: "h-9 px-5 text-sm rounded-lark-sm",
    xl: "h-10 px-6 text-base rounded-lark-md"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
