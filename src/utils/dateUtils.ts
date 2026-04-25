export type DateStatus = 'overdue' | 'soon' | 'normal' | 'none';

export function getDateStatus(dueDate: string | undefined): DateStatus {
  if (!dueDate) return 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'soon';
  return 'normal';
}

export function getDateStatusClasses(status: DateStatus): string {
  switch (status) {
    case 'overdue':
      return 'text-red-500 font-semibold';
    case 'soon':
      return 'text-amber-500 font-medium';
    case 'normal':
      return 'text-emerald-500';
    default:
      return 'text-gray-400';
  }
}

export function getDateIndicatorClasses(status: DateStatus): string {
  switch (status) {
    case 'overdue':
      return 'bg-red-500';
    case 'soon':
      return 'bg-amber-500';
    case 'normal':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-300';
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function getPriorityClasses(priority: string): string {
  switch (priority) {
    case '高':
      return 'bg-red-100 text-red-700 border-red-200';
    case '中':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case '低':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCalendarDays(year: number, month: number): Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; dateStr: string }> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0=Sunday
  const daysInMonth = lastDay.getDate();

  const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; dateStr: string }> = [];
  const today = new Date();
  const todayStr = formatDateStr(today);

  // 前月补位
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({ date: d, isCurrentMonth: false, isToday: formatDateStr(d) === todayStr, dateStr: formatDateStr(d) });
  }

  // 当月
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true, isToday: formatDateStr(d) === todayStr, dateStr: formatDateStr(d) });
  }

  // 后月补位（补满 6 行 = 42 天）
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false, isToday: formatDateStr(d) === todayStr, dateStr: formatDateStr(d) });
  }

  return days;
}

export function getTasksForDate<T extends { dueDate: string; completed: boolean }>(items: T[], dateStr: string): T[] {
  return items.filter(t => t.dueDate === dateStr);
}

export function getSubTasksForDate<T extends { dueDate: string; completed: boolean }>(items: T[], dateStr: string): T[] {
  return items.filter(s => s.dueDate === dateStr);
}
