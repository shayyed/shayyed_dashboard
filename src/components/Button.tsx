import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  onClick,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantClasses = {
    primary: 'bg-[#111111] text-white hover:bg-[#222222] focus-visible:ring-[#111111] border border-transparent',
    secondary: 'bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F7F7F7] hover:text-[#111111] focus-visible:ring-[#E5E5E5]',
    ghost: 'bg-transparent text-[#111111] hover:bg-[#F7F7F7] hover:text-[#111111] focus-visible:ring-[#E5E5E5] border border-transparent',
    destructive: 'bg-[#D34D72] text-white hover:bg-[#C23D62] focus-visible:ring-[#D34D72] border border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'جارٍ التحميل...' : children}
    </button>
  );
};
