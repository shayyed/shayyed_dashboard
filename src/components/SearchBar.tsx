import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'بحث...',
  value,
  onChange,
  onSearch,
  debounceMs = 300,
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState(value);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(searchValue);
      onSearch?.(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onChange, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-[#666666]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="w-full pr-10 pl-4 py-2 border border-[#E5E5E5] rounded-md text-[#111111] focus:outline-none focus:border-[#111111] bg-white"
        dir="rtl"
      />
    </div>
  );
};
