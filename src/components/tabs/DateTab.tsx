import { useState, useMemo } from 'react';
import type { Task, SubTask } from '../../types';
import { getCalendarDays, getTasksForDate, getSubTasksForDate, getPriorityClasses } from '../../utils/dateUtils';

interface DateTabProps {
  tasks: Task[];
  subTasks: SubTask[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function DateTab({ tasks, subTasks }: DateTabProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
    setExpandedDate(null);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
    setExpandedDate(null);
  };

  const handleToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setExpandedDate(null);
  };

  const handleDateClick = (dateStr: string) => {
    setExpandedDate(prev => (prev === dateStr ? null : dateStr));
  };

  const monthLabel = `${viewYear}年${viewMonth + 1}月`;

  return (
    <div>
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="glass-btn px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[rgba(var(--color-primary-rgb),1)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">{monthLabel}</span>
          <button
            onClick={handleToday}
            className="glass-btn px-3 py-1 text-xs text-[rgba(var(--color-primary-rgb),1)] border-[rgba(var(--color-primary-rgb),0.3)] hover:bg-[rgba(var(--color-primary-rgb),0.08)]"
          >
            今天
          </button>
        </div>
        <button
          onClick={handleNextMonth}
          className="glass-btn px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[rgba(var(--color-primary-rgb),1)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 日历 */}
      <div className="glass-card p-3 sm:p-4">
        {/* 星期标题行 */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-[var(--text-faint)] py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((dayInfo, idx) => {
            const dayTasks = getTasksForDate(tasks, dayInfo.dateStr);
            const daySubTasks = getSubTasksForDate(subTasks, dayInfo.dateStr);
            const totalItems = dayTasks.length + daySubTasks.length;
            const isExpanded = expandedDate === dayInfo.dateStr;

            return (
              <div
                key={idx}
                className={`
                  min-h-[60px] sm:min-h-[80px] rounded-lg p-1 sm:p-1.5 cursor-pointer
                  transition-all duration-200 border
                  ${dayInfo.isCurrentMonth ? 'bg-[var(--bg-filter)] hover:bg-[var(--bg-filter-hover)]' : 'bg-transparent opacity-40'}
                  ${dayInfo.isToday ? 'border-[rgba(var(--color-primary-rgb),0.5)] ring-2 ring-[rgba(var(--color-primary-rgb),0.15)]' : 'border-transparent hover:border-[var(--border-default)]'}
                  ${isExpanded ? 'bg-[rgba(var(--color-primary-rgb),0.08)] border-[rgba(var(--color-primary-rgb),0.3)]' : ''}
                `}
                onClick={() => handleDateClick(dayInfo.dateStr)}
              >
                {/* 日期数字 */}
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className={`
                      text-xs sm:text-sm font-medium
                      ${dayInfo.isToday ? 'text-[rgba(var(--color-primary-rgb),1)] font-bold' : ''}
                      ${!dayInfo.isCurrentMonth ? 'text-[var(--text-weakest)]' : 'text-[var(--text-primary)]'}
                    `}
                  >
                    {dayInfo.date.getDate()}
                  </span>
                  {/* 任务圆点指示器 */}
                  {totalItems > 0 && (
                    <div className="flex gap-0.5">
                      {dayTasks.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                      {daySubTasks.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* 任务标签（紧凑模式） */}
                {totalItems > 0 && (
                  <div className="space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className="text-[10px] leading-tight px-1 py-0.5 rounded bg-[rgba(var(--color-primary-rgb),0.15)] text-[rgba(var(--color-primary-rgb),1)] truncate"
                        title={task.name}
                      >
                        {task.name}
                      </div>
                    ))}
                    {daySubTasks.slice(0, 1).map(st => (
                      <div
                        key={st.id}
                        className="text-[10px] leading-tight px-1 py-0.5 rounded bg-[var(--bg-filter)] text-[var(--text-secondary)] truncate"
                        title={st.name}
                      >
                        {st.name}
                      </div>
                    ))}
                    {totalItems > 3 && (
                      <div className="text-[10px] text-[var(--text-faint)] px-1">
                        +{totalItems - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 展开的日期详情 */}
      {expandedDate && (
          <div className="glass-card-solid p-4 mt-3 border-2 border-[rgba(var(--color-primary-rgb),0.3)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                {expandedDate} 的任务
              </h4>
              <button
                onClick={() => setExpandedDate(null)}
                className="text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(() => {
              const dayTasks = getTasksForDate(tasks, expandedDate);
              const daySubTasks = getSubTasksForDate(subTasks, expandedDate);
              const total = dayTasks.length + daySubTasks.length;

              if (total === 0) {
                return (
                  <p className="text-sm text-[var(--text-faint)] text-center py-4">
                    当天没有待办任务
                  </p>
                );
              }

              return (
                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        task.completed
                          ? 'bg-[var(--bg-filter)] border-[var(--border-default)] opacity-50'
                          : 'bg-[rgba(var(--color-primary-rgb),0.08)] border-[rgba(var(--color-primary-rgb),0.2)]'
                      }`}
                    >
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getPriorityClasses(task.priority)}`}
                      >
                        {task.priority}
                      </span>
                      <span className={`text-sm font-medium flex-1 truncate ${
                        task.completed ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {task.name}
                      </span>
                      {task.estimatedTime && (
                        <span className="text-xs text-[var(--text-faint)]">
                          {task.estimatedTime}
                        </span>
                      )}
                    </div>
                  ))}
                  {daySubTasks.map(st => (
                    <div
                      key={st.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        st.completed
                          ? 'bg-[var(--bg-filter)] border-[var(--border-default)] opacity-50'
                          : 'bg-[var(--bg-filter)] border border-[var(--border-default)]'
                      }`}
                    >
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-filter-hover)] text-[var(--text-muted)] border border-[var(--border-default)]">
                        子任务
                      </span>
                      <span className={`text-sm flex-1 truncate ${
                        st.completed ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {st.name}
                      </span>
                      {st.estimatedTime && (
                        <span className="text-xs text-[var(--text-faint)]">
                          {st.estimatedTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
      )}
    </div>
  );
}
