import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TimePicker } from './TimePicker';
import { FileUploader } from './FileUploader';
import type { TaskFormData, Task } from '../types';

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  editingTask?: Task | null;
  groups: string[];
}

const initialFormData: TaskFormData = {
  name: '',
  group: '工作',
  priority: '中',
  dueDate: '',
  estimatedTime: '',
  attachments: [],
  notes: '',
};

const priorityOptions: { value: TaskFormData['priority']; label: string; color: string }[] = [
  { value: '高', label: '高优先级', color: 'bg-red-500' },
  { value: '中', label: '中优先级', color: 'bg-amber-500' },
  { value: '低', label: '低优先级', color: 'bg-blue-500' },
];

export function TaskForm({ onSubmit, onCancel, editingTask, groups }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name,
        group: editingTask.group,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        estimatedTime: editingTask.estimatedTime || '',
        attachments: Array.isArray(editingTask.attachments) ? editingTask.attachments : [],
        notes: editingTask.notes || '',
      });
    } else {
      setFormData(prev => ({ ...prev, group: groups[0] || '工作' }));
    }
  }, [editingTask, groups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    if (!editingTask) {
      setFormData({ ...initialFormData, group: groups[0] || '工作' });
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="glass-card p-5 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">
        {editingTask ? '编辑任务' : '新建任务'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="输入任务名称..."
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="glass-input w-full px-4 py-3 text-sm"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">分组</label>
          <select
            value={formData.group}
            onChange={e => setFormData(prev => ({ ...prev, group: e.target.value }))}
            className="glass-input w-full px-4 py-3 text-sm"
          >
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">优先级</label>
          <div className="flex gap-2">
            {priorityOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, priority: opt.value }))}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  formData.priority === opt.value
                    ? 'border-current bg-[var(--bg-card-solid)] shadow-sm'
                    : 'border-[var(--border-default)] bg-gray-50/50 text-[var(--text-faint)] hover:border-[var(--border-input)]'
                }`}
                style={formData.priority === opt.value ? { color: opt.color === 'bg-red-500' ? '#ef4444' : opt.color === 'bg-amber-500' ? '#f59e0b' : '#3b82f6' } : {}}
              >
                <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">截止日期</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="glass-input w-full px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">预估时间</label>
          <TimePicker
            value={formData.estimatedTime}
            onChange={val => setFormData(prev => ({ ...prev, estimatedTime: val }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[var(--text-faint)] text-xs mb-1.5 block">备注</label>
          <textarea
            placeholder="备注信息..."
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="glass-input w-full px-4 py-3 text-sm resize-none"
            rows={2}
          />
        </div>
        <div className="sm:col-span-2">
          <FileUploader
            value={formData.attachments}
            onChange={attachments => setFormData(prev => ({ ...prev, attachments }))}
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button type="submit" className="glass-btn glass-btn-primary px-5 py-2.5 text-sm font-medium">
          {editingTask ? '保存修改' : '添加任务'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="glass-btn px-5 py-2.5 text-sm">
            取消
          </button>
        )}
      </div>
    </motion.form>
  );
}
