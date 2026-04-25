import { motion } from 'framer-motion';
import type { Task } from '../types';

interface StatsPanelProps {
  tasks: Task[];
}

export function StatsPanel({ tasks }: StatsPanelProps) {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(t.dueDate) < today;
  }).length;

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-card p-5">
      <h3 className="text-[var(--text-faint)] text-xs font-medium mb-4 uppercase tracking-wider">统计概览</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>总任务</span>
          <span className="font-semibold text-[var(--text-primary)]">{totalCount}</span>
        </div>
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>已完成</span>
          <span className="font-semibold text-emerald-500">{completedCount}</span>
        </div>
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>已过期</span>
          <span className={`font-semibold ${overdueCount > 0 ? 'text-red-500' : 'text-[var(--text-weakest)]'}`}>{overdueCount}</span>
        </div>
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="w-full h-1.5 bg-[var(--bg-filter)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[var(--text-faint)] text-xs mt-1.5 text-right">{progressPercent}% 完成</p>
          </div>
        )}
      </div>
    </div>
  );
}
