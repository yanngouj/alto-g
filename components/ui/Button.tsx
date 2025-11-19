import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0";
  
  const variants = {
    primary: "bg-alto-navy text-white hover:bg-alto-navyLight shadow-lg hover:shadow-xl",
    secondary: "bg-alto-sage text-alto-navy hover:bg-alto-sageLight shadow-md hover:shadow-lg",
    outline: "border-2 border-alto-navy text-alto-navy hover:bg-alto-navy hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};