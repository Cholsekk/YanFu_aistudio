import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const TIME_OPTIONS = [
  { label: '今天', value: 'today' },
  { label: '过去 7 天', value: '7d' },
  { label: '过去 4 周', value: '4w' },
  { label: '过去 3 月', value: '3m' },
  { label: '过去 12 月', value: '12m' },
  { label: '本月至今', value: 'mt' },
  { label: '本季度至今', value: 'qt' },
  { label: '本年至今', value: 'yt' },
];

interface TimeRangeSelectorProps {
  onRangeChange: (start: string, end: string) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(TIME_OPTIONS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().slice(0, 16).replace('T', ' ');
  };

  const handleSelect = (option: typeof TIME_OPTIONS[0]) => {
    setSelected(option);
    setIsOpen(false);

    const end = new Date();
    const start = new Date();

    switch (option.value) {
      case '7d': start.setDate(end.getDate() - 7); break;
      case '4w': start.setDate(end.getDate() - 28); break;
      case '3m': start.setMonth(end.getMonth() - 3); break;
      case '12m': start.setFullYear(end.getFullYear() - 1); break;
      case 'mt': start.setDate(1); break;
      case 'qt': start.setMonth(Math.floor(end.getMonth() / 3) * 3); start.setDate(1); break;
      case 'yt': start.setMonth(0); start.setDate(1); break;
      case 'today': start.setHours(0, 0, 0, 0); break;
    }

    onRangeChange(formatDate(start), formatDate(end));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        {selected.label}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 ${selected.value === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {option.label}
              {selected.value === option.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
