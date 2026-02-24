import React from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  description,
  className = '',
}) => {
  const displayText = title || message || 'لا توجد بيانات';
  
  return (
    <div className={`text-center py-12 ${className}`}>
      <p className="text-[#111111] font-medium mb-2">{displayText}</p>
      {description && <p className="text-[#666666] text-sm">{description}</p>}
    </div>
  );
};
