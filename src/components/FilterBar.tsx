import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';
import { SearchableSelect } from './SearchableSelect';
import { Button } from './Button';
import { DatePicker } from './DatePicker';

interface Filter {
  type: 'text' | 'select' | 'date' | 'searchable-select' | 'number';
  key: string;
  label: string;
  options?: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters?: Filter[];
  onReset?: () => void;
  onApply?: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onReset,
  onApply,
  className = '',
  isOpen: controlledIsOpen,
  onToggle,
  children,
}) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalIsExpanded;
  const setIsExpanded = onToggle || setInternalIsExpanded;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Header with toggle button */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="secondary"
          onClick={() => {
            if (onToggle) {
              onToggle();
            } else {
              setInternalIsExpanded(!internalIsExpanded);
            }
          }}
          className="flex items-center gap-2"
        >
          <span>الفلاتر المتقدمة</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Filter content with smooth animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`flex flex-wrap gap-4 p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg ${
            isExpanded ? 'rounded-lg' : 'rounded-lg'
          }`}
        >
          {children ? (
            <>
              {children}
              {onReset && (
                <div className="flex items-start gap-2 w-full">
                  <Button variant="secondary" onClick={onReset} className="mt-6">
                    إعادة تعيين
                  </Button>
                </div>
              )}
            </>
          ) : filters && filters.length > 0 ? (
            <>
              {filters.map((filter) => (
                <div key={filter.key} className="flex-1 min-w-[200px]">
                  {filter.type === 'text' ? (
                    <Input
                      label={filter.label}
                      value={filter.value}
                      onChange={filter.onChange}
                    />
                  ) : filter.type === 'number' ? (
                    <Input
                      label={filter.label}
                      value={filter.value}
                      onChange={filter.onChange}
                      type="number"
                    />
                  ) : filter.type === 'date' ? (
                    <DatePicker
                      label={filter.label}
                      value={filter.value}
                      onChange={filter.onChange}
                    />
                  ) : filter.type === 'searchable-select' ? (
                    <SearchableSelect
                      label={filter.label}
                      options={filter.options || []}
                      value={filter.value}
                      onChange={filter.onChange}
                    />
                  ) : (
                    <Select
                      label={filter.label}
                      options={filter.options || []}
                      value={filter.value}
                      onChange={filter.onChange}
                    />
                  )}
                </div>
              ))}
              {onReset && (
                <div className="flex items-start gap-2">
                  <Button variant="secondary" onClick={onReset} className="mt-6">
                    إعادة تعيين
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
