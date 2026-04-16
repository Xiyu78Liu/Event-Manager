import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimePickerProps {
  value: string; // 格式 "2:30" 或空字符串
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 解析当前值
  const parseValue = (val: string): { hours: number; minutes: number } => {
    if (!val) return { hours: 0, minutes: 0 };
    const parts = val.split(':');
    return {
      hours: parseInt(parts[0]) || 0,
      minutes: parseInt(parts[1]) || 0,
    };
  };

  const { hours, minutes } = parseValue(value);

  const formatDisplay = (h: number, m: number) => {
    if (h === 0 && m === 0) return '';
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  // 小时列表 0-12
  const hourItems = Array.from({ length: 13 }, (_, i) => i);
  // 分钟列表 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
  const minuteItems = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleSelect = (h: number, m: number) => {
    onChange(formatDisplay(h, m));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-input w-full px-4 py-3 text-sm text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value ? `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}` : '点击设置预估时间'}
        </span>
        {value && (
          <span
            onClick={handleClear}
            className="text-gray-300 hover:text-red-400 transition-colors ml-2 text-xs"
          >
            清除
          </span>
        )}
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* 下拉面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full glass-card p-3 shadow-lg border border-gray-200/50"
          >
            <div className="flex gap-2">
              {/* 小时列 */}
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1.5 text-center">小时</div>
                <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-50/80">
                  {hourItems.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelect(h, minutes)}
                      className={`w-full py-1.5 text-sm text-center transition-colors ${
                        hours === h && isOpen
                          ? 'bg-indigo-500 text-white font-medium'
                          : 'text-gray-600 hover:bg-indigo-50'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* 分钟列 */}
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1.5 text-center">分钟</div>
                <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-50/80">
                  {minuteItems.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelect(hours, m)}
                      className={`w-full py-1.5 text-sm text-center transition-colors ${
                        minutes === m && isOpen
                          ? 'bg-indigo-500 text-white font-medium'
                          : 'text-gray-600 hover:bg-indigo-50'
                      }`}
                    >
                      {m}min
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 快捷选项 */}
            <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-100">
              {[
                { label: '15分钟', h: 0, m: 15 },
                { label: '30分钟', h: 0, m: 30 },
                { label: '1小时', h: 1, m: 0 },
                { label: '2小时', h: 2, m: 0 },
                { label: '3小时', h: 3, m: 0 },
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelect(opt.h, opt.m)}
                  className="flex-1 py-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
