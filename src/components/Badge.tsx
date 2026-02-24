import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  className = '',
}) => {
  const baseClasses = 'px-2 py-1 rounded-md text-xs font-medium';
  const variantClasses = {
    default: 'bg-[#111111]/10 text-[#111111]',
    success: 'bg-[#05C4AF]/10 text-[#05C4AF]',
    warning: 'bg-[#FDB022]/10 text-[#FDB022]',
    danger: 'bg-[#D34D72]/10 text-[#D34D72]',
    muted: 'bg-gray-500/10 text-gray-600',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  );
};
