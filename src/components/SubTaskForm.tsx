import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SubTaskFormData, SubTask } from '../types';
import { TimePicker } from './TimePicker';

interface SubTaskFormProps {
  onSubmit: (data: SubTaskFormData) => void;
  onCancel?: () => void;
  editingSubTask?: SubTask | null;
  groups?: string[]; // 保持接口一致，但不使用
}

const initialFormData: SubTaskFormData = {
  name: '',
  priority: '中',
  dueDate: '',
  estimatedTime: '',
  notes: '',
};

const priorityOptions = [
  { value: '高' as const, label: '高优先级', color: 'bg-red-500' },
  { value: '中' as const, label: '中优先级', color: 'bg-amber-500' },
  { value: '低' as const, label: '低优先级', color: 'bg-blue-500' },
];

// 将 estimatedTime 文本转换为 TimePicker 的 "H:M" 格式
function estimatedTimeToPickerValue(time: string): string {
  if (!time) return '';
  // 尝试匹配 "HhMmin" 或 "H:M" 或 "H小时M分钟" 等格式
  const match = time.match(/(\d+)\s*[h小时:]\s*(\d+)\s*[mmin分钟]?/);
  if (match) {
    return `${match[1]}:${match[2].padStart(2, '0')}`;
  }
  // 只有小时间
  const hMatch = time.match(/(\d+)\s*[h小时]/);
  if (hMatch) {
    return `${hMatch[1]}:00`;
  }
  // 只有分钟
  const mMatch = time.match(/(\d+)\s*[mmin分钟]/);
  if (mMatch) {
    return `0:${mMatch[1].padStart(2, '0')}`;
  }
  // 已经是 H:M 格式
  if (/^\d+:\d+$/.test(time)) return time;
  return '';
}

// 将 TimePicker 的 "H:M" 格式转换回 estimatedTime 文本
function pickerValueToEstimatedTime(value: string): string {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  if (h === 0 && m === 0) return '';
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}min`);
  return parts.join('');
}

export function SubTaskForm({ onSubmit, onCancel, editingSubTask }: SubTaskFormProps) {
  const [formData, setFormData] = useState<SubTaskFormData>(initialFormData);

  useEffect(() => {
    if (editingSubTask) {
      setFormData({
        name: editingSubTask.name,
        priority: editingSubTask.priority,
        dueDate: editingSubTask.dueDate,
        estimatedTime: editingSubTask.estimatedTime || '',
        notes: editingSubTask.notes || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingSubTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    if (!editingSubTask) {
      setFormData(initialFormData);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card p-4 mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-3">
        {editingSubTask ? '编辑子任务' : '新建子任务'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="输入子任务名称..."
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="glass-input w-full px-4 py-2.5 text-sm"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">优先级</label>
          <select
            value={formData.priority}
            onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as SubTaskFormData['priority'] }))}
            className="glass-input w-full px-4 py-2.5 text-sm"
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">截止日期</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="glass-input w-full px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">预估时间</label>
          <TimePicker
            value={estimatedTimeToPickerValue(formData.estimatedTime)}
            onChange={(val) => setFormData(prev => ({ ...prev, estimatedTime: pickerValueToEstimatedTime(val) }))}
          />
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">备注</label>
          <textarea
            placeholder="备注信息..."
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="glass-input w-full px-4 py-2.5 text-sm resize-none"
            rows={1}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <button type="submit" className="glass-btn glass-btn-primary px-5 py-2 text-sm font-medium">
          {editingSubTask ? '保存修改' : '添加子任务'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="glass-btn px-5 py-2 text-sm">
            取消
          </button>
        )}
      </div>
    </motion.form>
  );
}
