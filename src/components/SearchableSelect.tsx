import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SearchableSelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder = 'اختر...',
  options,
  value,
  onChange,
  error,
  required,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`mb-4 relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-[#111111] mb-1">
          {label} {required && <span className="text-[#666666]">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          ref={inputRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 pr-10 border border-[#E5E5E5] rounded-md text-[#111111] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111] transition-all flex items-center justify-between ${
            error ? 'border-[#D34D72]' : ''
          }`}
        >
          <span className={selectedOption ? 'text-[#111111]' : 'text-[#666666]'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-[#F7F7F7] rounded transition-colors"
              >
                <X className="w-3 h-3 text-[#666666]" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed z-[9999] bg-white border border-[#E5E5E5] rounded-lg mt-1 w-full min-w-[200px] max-h-[300px] overflow-hidden flex flex-col"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: inputRef.current?.offsetWidth || '200px',
          }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-[#E5E5E5]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full px-3 py-1.5 pr-10 border border-[#E5E5E5] rounded-md text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111]"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-[250px]">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-[#666666] text-center">
                لا توجد نتائج
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-right px-3 py-2 text-sm transition-colors ${
                    value === option.value
                      ? 'bg-[#111111] text-white'
                      : 'text-[#111111] hover:bg-[#F7F7F7]'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[#D34D72] mt-1">{error}</p>}
    </div>
  );
};
