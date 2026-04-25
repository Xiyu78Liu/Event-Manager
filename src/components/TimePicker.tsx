import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TimePickerProps {
  value: string; // 格式 "2:30" 或空字符串
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

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

  const updateDropdownPos = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 220),
      });
    }
  }, []);

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      updateDropdownPos();
    }
  };

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
      const target = e.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      const dropdown = document.getElementById('timepicker-dropdown');
      if (dropdown && dropdown.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // 窗口 resize 时更新位置
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updateDropdownPos();
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [isOpen, updateDropdownPos]);

  const dropdownContent = isOpen ? (
    <div
      id="timepicker-dropdown"
      className="fixed z-[99999] rounded-2xl p-3 shadow-xl"
      style={{
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        backgroundColor: 'var(--bg-card-solid)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="flex gap-2">
        {/* 小时列 */}
        <div className="flex-1">
          <div className="text-xs mb-1.5 text-center" style={{ color: 'var(--text-faint)' }}>小时</div>
          <div className="max-h-48 overflow-y-auto rounded-lg" style={{ backgroundColor: 'var(--bg-filter)' }}>
            {hourItems.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => handleSelect(h, minutes)}
                className={`w-full py-1.5 text-sm text-center transition-colors ${
                  hours === h
                    ? 'bg-indigo-500 text-white font-medium'
                    : ''
                }`}
                style={hours !== h ? { color: 'var(--text-secondary)' } : undefined}
                onMouseEnter={(e) => { if (hours !== h) e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.08)'; }}
                onMouseLeave={(e) => { if (hours !== h) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* 分钟列 */}
        <div className="flex-1">
          <div className="text-xs mb-1.5 text-center" style={{ color: 'var(--text-faint)' }}>分钟</div>
          <div className="max-h-48 overflow-y-auto rounded-lg" style={{ backgroundColor: 'var(--bg-filter)' }}>
            {minuteItems.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleSelect(hours, m)}
                className={`w-full py-1.5 text-sm text-center transition-colors ${
                  minutes === m
                    ? 'bg-indigo-500 text-white font-medium'
                    : ''
                }`}
                style={minutes !== m ? { color: 'var(--text-secondary)' } : undefined}
                onMouseEnter={(e) => { if (minutes !== m) e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.08)'; }}
                onMouseLeave={(e) => { if (minutes !== m) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {m}min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 快捷选项 */}
      <div className="flex gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid var(--border-default)' }}>
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
            className="flex-1 py-1 text-xs rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(var(--color-primary-rgb), 1)';
              e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div>
      {/* 触发按钮 */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="glass-input w-full px-4 py-3 text-sm text-left flex items-center justify-between"
      >
        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-faint)]'}>
          {value ? `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}` : '点击设置预估时间'}
        </span>
        {value && (
          <span
            onClick={handleClear}
            className="text-[var(--text-weakest)] hover:text-red-400 transition-colors ml-2 text-xs"
          >
            清除
          </span>
        )}
        <svg className="w-4 h-4 text-[var(--text-faint)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* 下拉面板 - 使用 Portal 渲染到 body，避免 backdrop-filter/transform 等属性影响 fixed 定位 */}
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
}
