import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { Dropdown } from 'antd';

const TIME_OPTIONS = [
  { label: '今天', value: 0, group: '常用' },
  { label: '过去 7 天', value: 7, group: '常用' },
  { label: '过去 4 周', value: 28, group: '常用' },
  { label: '过去 3 月', value: 90, group: '历史' },
  { label: '过去 12 月', value: 365, group: '历史' },
  { label: '本月至今', value: 'mt', group: '本期' },
  { label: '本季度至今', value: 'qt', group: '本期' },
  { label: '本年至今', value: 'yt', group: '本期' },
  { label: '所有时间', value: 'all', group: '其他' },
];

interface TimeRangeSelectorProps {
  onRangeChange: (start: string, end: string, period: string | number) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ onRangeChange }) => {
  const [selected, setSelected] = useState(TIME_OPTIONS[0]);

  const formatDate = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const handleSelect = (option: typeof TIME_OPTIONS[0]) => {
    setSelected(option);

    const end = new Date();
    const start = new Date();

    switch (option.value) {
      case 7: start.setDate(end.getDate() - 7); break;
      case 28: start.setDate(end.getDate() - 28); break;
      case 90: start.setMonth(end.getMonth() - 3); break;
      case 365: start.setFullYear(end.getFullYear() - 1); break;
      case 'mt': start.setDate(1); break;
      case 'qt': start.setMonth(Math.floor(end.getMonth() / 3) * 3); start.setDate(1); break;
      case 'yt': start.setMonth(0); start.setDate(1); break;
      case 0: start.setHours(0, 0, 0, 0); break;
      case 'all': 
        onRangeChange('', '', 'all');
        return;
    }

    onRangeChange(formatDate(start), formatDate(end), option.value);
  };

  const groups = Array.from(new Set(TIME_OPTIONS.map(o => o.group)));

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomLeft"
      popupRender={() => (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 w-56 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">选择时间范围</span>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {groups.map((group) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="px-4 py-1">
                  <span className="text-[10px] font-medium text-gray-400">{group}</span>
                </div>
                {TIME_OPTIONS.filter(o => o.group === group).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                      selected.value === option.value 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                    {selected.value === option.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    >
      <button 
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        {selected.label}
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
    </Dropdown>
  );
};

export default TimeRangeSelector;
