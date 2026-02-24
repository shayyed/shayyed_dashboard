import React from 'react';
import { Calendar } from 'lucide-react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'number' | 'date';
  error?: string;
  required?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required,
  className = '',
}) => {
  const isDateType = type === 'date';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[#111111] mb-1">
          {label} {required && <span className="text-[#666666]">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder || (isDateType ? 'dd/mm/yyyy' : undefined)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 ${isDateType ? 'pl-10' : ''} border border-[#E5E5E5] rounded-md text-[#111111] bg-white focus:outline-none focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111] transition-all ${error ? 'border-[#D34D72]' : ''}`}
          style={{
            ...(isDateType && {
              colorScheme: 'light',
            }),
          }}
        />
        {isDateType && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar className="w-4 h-4 text-[#666666]" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-[#D34D72] mt-1">{error}</p>}
    </div>
  );
};
