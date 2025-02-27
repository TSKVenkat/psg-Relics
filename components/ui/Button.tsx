import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-offset-2 focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary-dark focus:ring-2 focus:ring-offset-2 focus:ring-secondary",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      className="inline-flex items-center justify-center px-6 py-3 text-base sm:text-lg
    border border-white rounded-full
    transition-all duration-300 ease-out
    hover:-translate-y-2 hover:scale-105
    hover:bg-white hover:text-black
    focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black
    active:scale-95"
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2"></div>
      )}
      {children}
    </button>
  );
};