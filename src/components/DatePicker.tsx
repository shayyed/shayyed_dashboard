import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const DAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const DAYS_SHORT = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  error,
  required,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return date.getMonth();
    }
    return new Date().getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    if (value) {
      const date = new Date(value);
      return date.getFullYear();
    }
    return new Date().getFullYear();
  });
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // حساب موضع الـ popover
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  return (
    <div className={`mb-4 relative ${className}`} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-[#111111] mb-1">
          {label} {required && <span className="text-[#666666]">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={value ? formatDate(value) : ''}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 pr-12 border border-[#E5E5E5] rounded-md text-[#111111] bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#111111]/20 focus:border-[#111111] transition-all ${
            error ? 'border-[#D34D72]' : ''
          }`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-4 h-4 text-[#666666]" />
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed z-[9999] bg-white border border-[#E5E5E5] rounded-lg p-4 w-[320px]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-[#F7F7F7] rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#111111]" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#111111]">
                {MONTHS_AR[currentMonth]} {currentYear}
              </span>
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 hover:bg-[#F7F7F7] rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#111111]" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_SHORT.map((day, index) => (
              <div
                key={index}
                className="text-xs font-medium text-[#666666] text-center py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} className="aspect-square" />;
              }

              const todayClass = isToday(day) ? 'border border-[#111111]' : '';
              const selectedClass = isSelected(day)
                ? 'bg-[#111111] text-white'
                : 'hover:bg-[#F7F7F7] text-[#111111]';

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`aspect-square rounded-md text-sm font-medium transition-colors ${selectedClass} ${todayClass}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-[#666666] hover:text-[#111111] transition-colors"
            >
              مسح
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-sm text-[#111111] hover:text-[#666666] transition-colors font-medium"
            >
              اليوم
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[#D34D72] mt-1">{error}</p>}
    </div>
  );
};
