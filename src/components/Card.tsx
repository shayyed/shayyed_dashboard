import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border border-[#E5E5E5] rounded-lg p-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-[#111111] mb-4">{title}</h3>}
      {children}
    </div>
  );
};
